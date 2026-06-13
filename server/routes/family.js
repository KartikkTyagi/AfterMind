const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/helpers');
const { getFamilyGuideResponse } = require('../services/claudeAgent');

// @route   POST /api/family/verify-code
// @desc    Verify trusted contact access code and return contact info
router.post('/verify-code', async (req, res) => {
  const { accessCode } = req.body;

  if (!accessCode) {
    return res.status(400).json({ message: 'Access code is required' });
  }

  try {
    const { data: contact, error } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('access_code', accessCode.trim())
      .single();

    if (error || !contact) {
      return res.status(404).json({ success: false, message: 'Invalid access code. Please check and try again.' });
    }

    res.json({
      success: true,
      contact,
      estateId: contact.estate_id
    });
  } catch (err) {
    console.error("[Family Route] Code verification error:", err.message);
    res.status(500).json({ message: 'Server error verifying access code' });
  }
});

// @route   GET /api/family/estate/:accessCode
// @desc    Fetch complete estate profile details unlocked by the access code
router.get('/estate/:accessCode', async (req, res) => {
  const { accessCode } = req.params;

  try {
    // 1. Verify access code
    const { data: contact, error: contactErr } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('access_code', accessCode.trim())
      .single();

    if (contactErr || !contact) {
      return res.status(401).json({ message: 'Invalid or unauthorized access code' });
    }

    const estateId = contact.estate_id;

    // 2. Fetch the profile details
    const { data: estate, error: estateErr } = await supabase
      .from('estate_profiles')
      .select('*')
      .eq('id', estateId)
      .single();

    if (estateErr || !estate) {
      return res.status(404).json({ message: 'Estate profile not found' });
    }

    // 3. Fetch all child resources
    const [accounts, documents, assets, contacts, capsules] = await Promise.all([
      supabase.from('digital_accounts').select('*').eq('estate_id', estateId),
      supabase.from('documents').select('*').eq('estate_id', estateId),
      supabase.from('financial_assets').select('*').eq('estate_id', estateId),
      supabase.from('trusted_contacts').select('*').eq('estate_id', estateId),
      supabase.from('time_capsules').select('*').eq('estate_id', estateId)
    ]);

    // Filter time capsules: only return capsules intended for this specific contact
    // Matches by email or name (case-insensitive)
    const matchedCapsules = (capsules.data || []).filter(c => {
      const contactEmail = contact.email ? contact.email.toLowerCase() : '';
      const contactName = contact.full_name ? contact.full_name.toLowerCase() : '';
      const recEmail = c.recipient_email ? c.recipient_email.toLowerCase() : '';
      const recName = c.recipient_name ? c.recipient_name.toLowerCase() : '';
      
      return (contactEmail && recEmail === contactEmail) || 
             (contactName && recName.includes(contactName)) ||
             (recName && contactName.includes(recName));
    });

    res.json({
      estate,
      accounts: accounts.data || [],
      documents: documents.data || [],
      financial_assets: assets.data || [],
      trusted_contacts: contacts.data || [],
      time_capsules: matchedCapsules
    });

  } catch (err) {
    console.error("[Family Route] Fetch estate data error:", err.message);
    res.status(500).json({ message: 'Server error retrieving estate data' });
  }
});

// @route   POST /api/family/chat
// @desc    Grieving family assistant guide chat
router.post('/chat', async (req, res) => {
  const { accessCode, message, chatHistory } = req.body;

  if (!accessCode || !message) {
    return res.status(400).json({ message: 'Access code and message are required' });
  }

  try {
    // 1. Verify access code
    const { data: contact, error: contactErr } = await supabase
      .from('trusted_contacts')
      .select('estate_id')
      .eq('access_code', accessCode.trim())
      .single();

    if (contactErr || !contact) {
      return res.status(401).json({ message: 'Invalid or unauthorized access code' });
    }

    const estateId = contact.estate_id;

    // 2. Fetch the complete profile details to feed Claude Context
    const [estateRes, accountsRes, documentsRes, assetsRes, contactsRes] = await Promise.all([
      supabase.from('estate_profiles').select('*').eq('id', estateId).single(),
      supabase.from('digital_accounts').select('*').eq('estate_id', estateId),
      supabase.from('documents').select('*').eq('estate_id', estateId),
      supabase.from('financial_assets').select('*').eq('estate_id', estateId),
      supabase.from('trusted_contacts').select('*').eq('estate_id', estateId)
    ]);

    const estateProfile = {
      full_name: estateRes.data?.full_name,
      date_of_birth: estateRes.data?.date_of_birth,
      status: estateRes.data?.status,
      digital_accounts: accountsRes.data || [],
      documents: documentsRes.data || [],
      financial_assets: assetsRes.data || [],
      trusted_contacts: contactsRes.data || []
    };

    // 3. Get Claude Guide answer
    const reply = await getFamilyGuideResponse(message, estateProfile, chatHistory || []);

    res.json({ reply });

  } catch (err) {
    console.error("[Family Route] Guide chat error:", err.message);
    res.status(500).json({ message: 'Server error in Family Guide chat' });
  }
});

module.exports = router;
