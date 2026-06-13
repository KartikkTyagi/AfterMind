const express = require('express');
const router = express.Router();
const { supabase, calculateCompletionPercentage, generateAccessCode } = require('../utils/helpers');
const { getSetupChatResponse } = require('../services/claudeAgent');
const authMiddleware = require('../middleware/auth');
const { sendAccessCodeEmail } = require('../services/emailService');

// @route   POST /api/chat/message
// @desc    Process a user setup message, call Claude, extract data and reply
router.post('/message', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const { estateId } = req.user;

  if (!message) {
    return res.status(400).json({ message: 'Message content is required' });
  }

  try {
    // 1. Save user message in DB
    const { error: saveUserErr } = await supabase
      .from('chat_messages')
      .insert({
        estate_id: estateId,
        role: 'user',
        content: message
      });

    if (saveUserErr) throw saveUserErr;

    // 2. Fetch recent chat history (e.g., last 20 messages)
    const { data: history, error: historyErr } = await supabase
      .from('chat_messages')
      .select('role, content')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: true })
      .limit(30);

    if (historyErr) throw historyErr;

    // 3. Request Claude agent response and data extraction
    // Subtract the last message we just inserted from the history to avoid duplicate feeding,
    // getSetupChatResponse takes userMessage and previousHistory separately.
    const prevHistory = history.slice(0, -1);
    const aiResponse = await getSetupChatResponse(message, prevHistory);
    const { conversational_reply, extracted_data } = aiResponse;

    // 4. Save AI response in DB
    const { error: saveAiErr } = await supabase
      .from('chat_messages')
      .insert({
        estate_id: estateId,
        role: 'assistant',
        content: conversational_reply
      });

    if (saveAiErr) throw saveAiErr;

    let processedExtraction = null;

    // 5. If data was extracted, write it to the corresponding table
    if (extracted_data && extracted_data.type && extracted_data.data) {
      const type = extracted_data.type;
      const data = extracted_data.data;

      if (type === 'digital_account') {
        const { data: insertedData } = await supabase
          .from('digital_accounts')
          .insert({
            estate_id: estateId,
            platform: data.platform || 'General Platform',
            account_email: data.account_email || '',
            action: data.action || 'delete',
            status: 'pending',
            notes: data.notes || ''
          })
          .select()
          .single();
        processedExtraction = { type, data: insertedData };

      } else if (type === 'document') {
        const { data: insertedData } = await supabase
          .from('documents')
          .insert({
            estate_id: estateId,
            document_type: data.document_type || 'other',
            document_name: data.document_name || 'Important Document',
            location_description: data.location_description || 'Not specified'
          })
          .select()
          .single();
        processedExtraction = { type, data: insertedData };

      } else if (type === 'financial_asset') {
        const { data: insertedData } = await supabase
          .from('financial_assets')
          .insert({
            estate_id: estateId,
            asset_type: data.asset_type || 'bank',
            institution: data.institution || 'Unknown Institution',
            description: data.description || '',
            designated_recipient: data.designated_recipient || '',
            notes: data.notes || ''
          })
          .select()
          .single();
        processedExtraction = { type, data: insertedData };

      } else if (type === 'trusted_contact') {
        const accessCode = generateAccessCode();
        const { data: insertedData } = await supabase
          .from('trusted_contacts')
          .insert({
            estate_id: estateId,
            full_name: data.full_name || 'Trusted Friend',
            relationship: data.relationship || '',
            email: data.email || '',
            phone: data.phone || '',
            role: data.role || 'family',
            access_code: accessCode
          })
          .select()
          .single();
        processedExtraction = { type, data: insertedData };

        // Send access code email immediately in the background if email is provided
        if (insertedData && insertedData.email) {
          (async () => {
            try {
              const { data: estate } = await supabase
                .from('estate_profiles')
                .select('full_name')
                .eq('id', estateId)
                .single();
              const userName = estate?.full_name || 'AfterMind User';
              
              await sendAccessCodeEmail({
                toEmail: insertedData.email,
                contactName: insertedData.full_name,
                userName,
                accessCode: insertedData.access_code
              });
            } catch (mailErr) {
              console.error("[Chat Contact Extraction] Welcome access code email sending failed:", mailErr.message);
            }
          })();
        }

      } else if (type === 'time_capsule') {
        const { data: insertedData } = await supabase
          .from('time_capsules')
          .insert({
            estate_id: estateId,
            recipient_name: data.recipient_name || 'Recipient',
            recipient_email: data.recipient_email || '',
            subject: data.subject || 'A message for you',
            message_text: data.message_text || '',
            delivery_trigger: data.delivery_trigger || 'on_death',
            is_delivered: false
          })
          .select()
          .single();
        processedExtraction = { type, data: insertedData };

      } else if (type === 'special_wish') {
        // Map special_wish to documents as document_type 'other'
        const wishDetails = data.notes || data.wish || data.description || JSON.stringify(data);
        const { data: insertedData } = await supabase
          .from('documents')
          .insert({
            estate_id: estateId,
            document_type: 'other',
            document_name: 'Special Wish / Instruction',
            location_description: wishDetails
          })
          .select()
          .single();
        processedExtraction = { type: 'document', data: insertedData };
      }
    }

    // 6. Recalculate completion percentage
    const currentCompletion = await calculateCompletionPercentage(estateId);

    // Return conversational reply + information about the data extraction
    res.json({
      reply: conversational_reply,
      extracted: processedExtraction,
      completion_percentage: currentCompletion
    });

  } catch (err) {
    console.error("[Chat Route] Message processing error:", err.message);
    res.status(500).json({ message: 'Server error processing chat message' });
  }
});

// @route   GET /api/chat/history/:estateId
// @desc    Retrieve chat messages for the current user's estate
router.get('/history/:estateId', authMiddleware, async (req, res) => {
  const { estateId } = req.params;

  try {
    const { data: messages, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('estate_id', estateId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json(messages || []);
  } catch (err) {
    console.error("[Chat Route] History fetch error:", err.message);
    res.status(500).json({ message: 'Server error retrieving chat history' });
  }
});

module.exports = router;
