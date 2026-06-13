const express = require('express');
const router = express.Router();
const { supabase, calculateCompletionPercentage } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');

// @route   GET /api/capsules
// @desc    Get all time capsules for the authenticated user's estate
router.get('/', authMiddleware, async (req, res) => {
  const { estateId } = req.user;

  try {
    const { data: capsules, error } = await supabase
      .from('time_capsules')
      .select('*')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(capsules || []);
  } catch (err) {
    console.error("[Capsule Route] Fetch error:", err.message);
    res.status(500).json({ message: 'Server error fetching time capsules' });
  }
});

// @route   POST /api/capsules
// @desc    Create a new time capsule message
router.post('/', authMiddleware, async (req, res) => {
  const { recipient_name, recipient_email, subject, message_text, delivery_trigger, delivery_date, delivery_event } = req.body;
  const { estateId } = req.user;

  if (!recipient_name || !message_text) {
    return res.status(400).json({ message: 'Recipient name and message text are required' });
  }

  try {
    const { data, error } = await supabase
      .from('time_capsules')
      .insert({
        estate_id: estateId,
        recipient_name,
        recipient_email: recipient_email || '',
        subject: subject || 'A message left for you',
        message_text,
        delivery_trigger: delivery_trigger || 'on_death',
        delivery_date: delivery_date || null,
        delivery_event: delivery_event || '',
        is_delivered: false
      })
      .select()
      .single();

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.status(201).json(data);
  } catch (err) {
    console.error("[Capsule Route] Create error:", err.message);
    res.status(500).json({ message: 'Server error creating time capsule' });
  }
});

// @route   PUT /api/capsules/:id
// @desc    Update an existing time capsule message
router.put('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { recipient_name, recipient_email, subject, message_text, delivery_trigger, delivery_date, delivery_event } = req.body;
  const { estateId } = req.user;

  try {
    const { data, error } = await supabase
      .from('time_capsules')
      .update({
        recipient_name,
        recipient_email,
        subject,
        message_text,
        delivery_trigger,
        delivery_date: delivery_date || null,
        delivery_event: delivery_event || '',
        updated_at: new Date()
      })
      .eq('id', id)
      .eq('estate_id', estateId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("[Capsule Route] Update error:", err.message);
    res.status(500).json({ message: 'Server error updating time capsule' });
  }
});

// @route   DELETE /api/capsules/:id
// @desc    Delete a time capsule message
router.delete('/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estateId } = req.user;

  try {
    const { error } = await supabase
      .from('time_capsules')
      .delete()
      .eq('id', id)
      .eq('estate_id', estateId);

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.json({ message: 'Time capsule deleted successfully' });
  } catch (err) {
    console.error("[Capsule Route] Delete error:", err.message);
    res.status(500).json({ message: 'Server error deleting time capsule' });
  }
});

module.exports = router;
