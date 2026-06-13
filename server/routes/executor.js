const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/helpers');
const { triggerExecution } = require('../services/executionEngine');
// Note: We do not restrict trigger/status/log via JWT auth middleware in the same way,
// because a grieving family contact accessing this via family portal might NOT be logged in,
// but they DO have their access code. We can verify access in family portal or protect executor paths based on verification.
// For testing/hackathon, we'll allow triggers and log fetches if they provide the correct parameters.

// @route   POST /api/executor/trigger
// @desc    Activate AfterMind estate execution sequence
router.post('/trigger', async (req, res) => {
  const { estateId, triggeredBy } = req.body; // triggeredBy is the trusted contact's ID

  if (!estateId || !triggeredBy) {
    return res.status(400).json({ message: 'Estate ID and Triggered By contact ID are required' });
  }

  try {
    // 1. Verify that the estate exists and isn't already executing/executed
    const { data: estate, error } = await supabase
      .from('estate_profiles')
      .select('status')
      .eq('id', estateId)
      .single();

    if (error || !estate) {
      return res.status(404).json({ message: 'Estate profile not found' });
    }

    if (estate.status === 'triggered' || estate.status === 'executed') {
      return res.status(400).json({ message: 'Execution sequence has already been initiated for this estate.' });
    }

    // 2. Fire and forget: trigger the execution flow in the background
    // (It runs asynchronously with delays, updating the database logs table)
    triggerExecution(estateId, triggeredBy)
      .then(result => console.log("[Executor Route] Background execution finished:", result))
      .catch(err => console.error("[Executor Route] Background execution failed:", err));

    res.json({
      message: 'AfterMind execution sequence initialized. Commencing digital estate transfer protocols.',
      status: 'triggered'
    });

  } catch (err) {
    console.error("[Executor Route] Trigger error:", err.message);
    res.status(500).json({ message: 'Server error triggering execution sequence' });
  }
});

// @route   GET /api/executor/status/:estateId
// @desc    Get the current execution status of an estate profile
router.get('/status/:estateId', async (req, res) => {
  const { estateId } = req.params;

  try {
    const { data: estate, error } = await supabase
      .from('estate_profiles')
      .select('status, triggered_at')
      .eq('id', estateId)
      .single();

    if (error || !estate) {
      return res.status(404).json({ message: 'Estate profile not found' });
    }

    res.json(estate);
  } catch (err) {
    console.error("[Executor Route] Status query error:", err.message);
    res.status(500).json({ message: 'Server error fetching estate status' });
  }
});

// @route   GET /api/executor/log/:estateId
// @desc    Get execution log history for the estate
router.get('/log/:estateId', async (req, res) => {
  const { estateId } = req.params;

  try {
    const { data: logs, error } = await supabase
      .from('execution_log')
      .select('*')
      .eq('estate_id', estateId)
      .order('executed_at', { ascending: true });

    if (error) throw error;

    res.json(logs || []);
  } catch (err) {
    console.error("[Executor Route] Log fetch error:", err.message);
    res.status(500).json({ message: 'Server error fetching execution log' });
  }
});

module.exports = router;
