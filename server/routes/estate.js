const express = require('express');
const router = express.Router();
const { supabase, calculateCompletionPercentage, generateAccessCode } = require('../utils/helpers');
const authMiddleware = require('../middleware/auth');
const { sendAccessCodeEmail } = require('../services/emailService');

/* =========================================================================
   ESTATE PROFILE ROUTES
   ========================================================================= */

// @route   GET /api/estate/:userId
// @desc    Get the estate profile by user ID
router.get('/estate/:userId', authMiddleware, async (req, res) => {
  const { userId } = req.params;

  try {
    const { data: estate, error } = await supabase
      .from('estate_profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      return res.status(404).json({ message: 'Estate profile not found' });
    }

    res.json(estate);
  } catch (err) {
    console.error("[Estate Route] Fetch error:", err.message);
    res.status(500).json({ message: 'Server error fetching estate profile' });
  }
});

// @route   PUT /api/estate/:estateId
// @desc    Update estate profile details
router.put('/estate/:estateId', authMiddleware, async (req, res) => {
  const { estateId } = req.params;
  const { full_name, date_of_birth } = req.body;

  try {
    const { data: updatedEstate, error } = await supabase
      .from('estate_profiles')
      .update({
        full_name,
        date_of_birth,
        updated_at: new Date()
      })
      .eq('id', estateId)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    await calculateCompletionPercentage(estateId);

    res.json(updatedEstate);
  } catch (err) {
    console.error("[Estate Route] Update error:", err.message);
    res.status(500).json({ message: 'Server error updating estate profile' });
  }
});

// @route   GET /api/estate/:estateId/completion
// @desc    Recalculate and fetch the completion percentage
router.get('/estate/:estateId/completion', authMiddleware, async (req, res) => {
  const { estateId } = req.params;

  try {
    const percentage = await calculateCompletionPercentage(estateId);
    res.json({ completion_percentage: percentage });
  } catch (err) {
    console.error("[Estate Route] Completion query error:", err.message);
    res.status(500).json({ message: 'Server error calculating completion percentage' });
  }
});

// @route   GET /api/estate/:estateId/details
// @desc    Get complete estate details for the dashboard
router.get('/estate/:estateId/details', authMiddleware, async (req, res) => {
  const { estateId } = req.params;

  try {
    if (req.user.estateId !== estateId) {
      return res.status(401).json({ message: 'Unauthorized access to estate details' });
    }

    const [estate, accounts, documents, assets, contacts, capsules] = await Promise.all([
      supabase.from('estate_profiles').select('*').eq('id', estateId).single(),
      supabase.from('digital_accounts').select('*').eq('estate_id', estateId),
      supabase.from('documents').select('*').eq('estate_id', estateId),
      supabase.from('financial_assets').select('*').eq('estate_id', estateId),
      supabase.from('trusted_contacts').select('*').eq('estate_id', estateId),
      supabase.from('time_capsules').select('*').eq('estate_id', estateId)
    ]);

    if (estate.error || !estate.data) {
      return res.status(404).json({ message: 'Estate profile not found' });
    }

    res.json({
      estate: estate.data,
      accounts: accounts.data || [],
      documents: documents.data || [],
      financial_assets: assets.data || [],
      trusted_contacts: contacts.data || [],
      time_capsules: capsules.data || []
    });

  } catch (err) {
    console.error("[Estate Route] Details fetch error:", err.message);
    res.status(500).json({ message: 'Server error retrieving estate details' });
  }
});

/* =========================================================================
   DIGITAL ACCOUNTS CRUD
   ========================================================================= */

// @route   POST /api/accounts
router.post('/accounts', authMiddleware, async (req, res) => {
  const { platform, account_email, action, notes } = req.body;
  const { estateId } = req.user;

  if (!platform || !action) {
    return res.status(400).json({ message: 'Platform and action are required' });
  }

  try {
    const { data, error } = await supabase
      .from('digital_accounts')
      .insert({
        estate_id: estateId,
        platform,
        account_email,
        action,
        status: 'pending',
        notes: notes || ''
      })
      .select()
      .single();

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.status(201).json(data);
  } catch (err) {
    console.error("[Estate Accounts Route] Create error:", err.message);
    res.status(500).json({ message: 'Server error creating digital account' });
  }
});

// @route   PUT /api/accounts/:id
router.put('/accounts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { platform, account_email, action, notes, status } = req.body;
  const { estateId } = req.user;

  try {
    const { data, error } = await supabase
      .from('digital_accounts')
      .update({
        platform,
        account_email,
        action,
        status,
        notes
      })
      .eq('id', id)
      .eq('estate_id', estateId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("[Estate Accounts Route] Update error:", err.message);
    res.status(500).json({ message: 'Server error updating digital account' });
  }
});

// @route   DELETE /api/accounts/:id
router.delete('/accounts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estateId } = req.user;

  try {
    const { error } = await supabase
      .from('digital_accounts')
      .delete()
      .eq('id', id)
      .eq('estate_id', estateId);

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.json({ message: 'Digital account deleted successfully' });
  } catch (err) {
    console.error("[Estate Accounts Route] Delete error:", err.message);
    res.status(500).json({ message: 'Server error deleting digital account' });
  }
});

/* =========================================================================
   DOCUMENTS CRUD
   ========================================================================= */

// @route   POST /api/documents
router.post('/documents', authMiddleware, async (req, res) => {
  const { document_type, document_name, location_description, storage_path } = req.body;
  const { estateId } = req.user;

  if (!document_type || !document_name) {
    return res.status(400).json({ message: 'Document type and name are required' });
  }

  try {
    const { data, error } = await supabase
      .from('documents')
      .insert({
        estate_id: estateId,
        document_type,
        document_name,
        location_description: location_description || '',
        storage_path: storage_path || null
      })
      .select()
      .single();

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.status(201).json(data);
  } catch (err) {
    console.error("[Estate Documents Route] Create error:", err.message);
    res.status(500).json({ message: 'Server error creating document record' });
  }
});

// @route   DELETE /api/documents/:id
router.delete('/documents/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estateId } = req.user;

  try {
    const { error } = await supabase
      .from('documents')
      .delete()
      .eq('id', id)
      .eq('estate_id', estateId);

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.json({ message: 'Document record deleted successfully' });
  } catch (err) {
    console.error("[Estate Documents Route] Delete error:", err.message);
    res.status(500).json({ message: 'Server error deleting document record' });
  }
});

/* =========================================================================
   FINANCIAL ASSETS CRUD
   ========================================================================= */

// @route   POST /api/assets
router.post('/assets', authMiddleware, async (req, res) => {
  const { asset_type, institution, description, designated_recipient, notes } = req.body;
  const { estateId } = req.user;

  if (!asset_type || !institution) {
    return res.status(400).json({ message: 'Asset type and institution are required' });
  }

  try {
    const { data, error } = await supabase
      .from('financial_assets')
      .insert({
        estate_id: estateId,
        asset_type,
        institution,
        description: description || '',
        designated_recipient: designated_recipient || '',
        notes: notes || ''
      })
      .select()
      .single();

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.status(201).json(data);
  } catch (err) {
    console.error("[Estate Assets Route] Create error:", err.message);
    res.status(500).json({ message: 'Server error creating financial asset' });
  }
});

// @route   PUT /api/assets/:id
router.put('/assets/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { asset_type, institution, description, designated_recipient, notes } = req.body;
  const { estateId } = req.user;

  try {
    const { data, error } = await supabase
      .from('financial_assets')
      .update({
        asset_type,
        institution,
        description,
        designated_recipient,
        notes
      })
      .eq('id', id)
      .eq('estate_id', estateId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("[Estate Assets Route] Update error:", err.message);
    res.status(500).json({ message: 'Server error updating financial asset' });
  }
});

// @route   DELETE /api/assets/:id
router.delete('/assets/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estateId } = req.user;

  try {
    const { error } = await supabase
      .from('financial_assets')
      .delete()
      .eq('id', id)
      .eq('estate_id', estateId);

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.json({ message: 'Financial asset deleted successfully' });
  } catch (err) {
    console.error("[Estate Assets Route] Delete error:", err.message);
    res.status(500).json({ message: 'Server error deleting financial asset' });
  }
});

/* =========================================================================
   TRUSTED CONTACTS CRUD
   ========================================================================= */

// @route   POST /api/contacts
router.post('/contacts', authMiddleware, async (req, res) => {
  const { full_name, relationship, email, phone, role } = req.body;
  const { estateId } = req.user;

  if (!full_name) {
    return res.status(400).json({ message: 'Full name is required' });
  }

  try {
    const accessCode = generateAccessCode();
    
    const { data, error } = await supabase
      .from('trusted_contacts')
      .insert({
        estate_id: estateId,
        full_name,
        relationship: relationship || '',
        email: email || '',
        phone: phone || '',
        role: role || 'family',
        access_code: accessCode
      })
      .select()
      .single();

    if (error) throw error;

    await calculateCompletionPercentage(estateId);

    // Send the access code welcome email immediately in the background if email is provided
    if (data && data.email) {
      (async () => {
        try {
          const { data: estate } = await supabase
            .from('estate_profiles')
            .select('full_name')
            .eq('id', estateId)
            .single();
          const userName = estate?.full_name || 'AfterMind User';
          
          await sendAccessCodeEmail({
            toEmail: data.email,
            contactName: data.full_name,
            userName,
            accessCode: data.access_code
          });
        } catch (mailErr) {
          console.error("[Estate Contacts Route] Welcome access code email sending failed:", mailErr.message);
        }
      })();
    }

    res.status(201).json(data);
  } catch (err) {
    console.error("[Estate Contacts Route] Create error:", err.message);
    res.status(500).json({ message: 'Server error creating trusted contact' });
  }
});

// @route   PUT /api/contacts/:id
router.put('/contacts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { full_name, relationship, email, phone, role } = req.body;
  const { estateId } = req.user;

  try {
    const { data, error } = await supabase
      .from('trusted_contacts')
      .update({
        full_name,
        relationship,
        email,
        phone,
        role
      })
      .eq('id', id)
      .eq('estate_id', estateId)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (err) {
    console.error("[Estate Contacts Route] Update error:", err.message);
    res.status(500).json({ message: 'Server error updating trusted contact' });
  }
});

// @route   DELETE /api/contacts/:id
router.delete('/contacts/:id', authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { estateId } = req.user;

  try {
    const { error } = await supabase
      .from('trusted_contacts')
      .delete()
      .eq('id', id)
      .eq('estate_id', estateId);

    if (error) throw error;

    await calculateCompletionPercentage(estateId);
    res.json({ message: 'Trusted contact deleted successfully' });
  } catch (err) {
    console.error("[Estate Contacts Route] Delete error:", err.message);
    res.status(500).json({ message: 'Server error deleting trusted contact' });
  }
});

module.exports = router;
