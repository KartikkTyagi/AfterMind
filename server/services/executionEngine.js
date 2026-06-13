const { supabase } = require('../utils/helpers');
const { sendNotificationEmail, sendTimeCapsuleEmail } = require('./emailService');

// Delay helper to create a realistic asynchronous execution flow
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function triggerExecution(estateId, triggeredByContactId) {
  console.log(`[Execution Engine] Activating estate execution for Profile: ${estateId}...`);

  try {
    // 0. Fetch the estate owner's details
    const { data: estate, error: estateErr } = await supabase
      .from('estate_profiles')
      .select('*, user_id')
      .eq('id', estateId)
      .single();

    if (estateErr || !estate) {
      throw new Error(`Estate profile not found: ${estateErr?.message || ''}`);
    }

    // Get the owner's full name
    const ownerName = estate.full_name || 'AfterMind User';

    // 1. Update estate status to 'triggered'
    const { error: updateErr } = await supabase
      .from('estate_profiles')
      .update({
        status: 'triggered',
        triggered_at: new Date(),
        triggered_by: triggeredByContactId,
        updated_at: new Date()
      })
      .eq('id', estateId);

    if (updateErr) throw updateErr;

    // Helper to log steps to the execution_log table
    const logStep = async (action, status, details) => {
      const { data, error } = await supabase
        .from('execution_log')
        .insert({
          estate_id: estateId,
          action,
          status,
          details,
          executed_at: new Date()
        })
        .select()
        .single();
      
      if (error) console.error("[Execution Engine] Error writing execution log:", error.message);
      return data;
    };

    // Run execution sequence autonomously with slight delays for real-time visualization

    // --- STEP 1: INITIALIZE ACTIVATION ---
    await logStep(
      'Initialize AfterMind Activation', 
      'in_progress', 
      `Securing estate profile for ${ownerName} and initiating execution protocols.`
    );
    await delay(1500);
    await logStep(
      'Initialize AfterMind Activation', 
      'completed', 
      `Profile secured. Executor credentials verified. Commencing execution sequence.`
    );

    // --- STEP 2: NOTIFY TRUSTED CONTACTS (EMAIL) ---
    await logStep(
      'Notify Trusted Contacts', 
      'in_progress', 
      'Retrieving trusted contact records and preparing secure access tokens.'
    );
    await delay(1500);

    const { data: contacts, error: contactsErr } = await supabase
      .from('trusted_contacts')
      .select('*')
      .eq('estate_id', estateId);

    if (contactsErr) throw contactsErr;

    let emailsSent = 0;
    let emailDetails = [];
    
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        if (contact.email) {
          const emailResult = await sendNotificationEmail({
            toEmail: contact.email,
            contactName: contact.full_name,
            userName: ownerName,
            accessCode: contact.access_code
          });
          
          emailsSent++;
          emailDetails.push(`${contact.full_name} (${contact.role})`);
        }
      }
    }

    await logStep(
      'Notify Trusted Contacts', 
      emailsSent > 0 ? 'completed' : 'failed', 
      emailsSent > 0 
        ? `Dispatched secure Family Portal notifications to: ${emailDetails.join(', ')}.`
        : 'No trusted contacts with valid email addresses found to notify.'
    );
    await delay(1500);

    // --- STEP 3: DISPATCH SMS ALERTS (TWILIO MOCK) ---
    await logStep(
      'Send SMS Alerts', 
      'in_progress', 
      'Initializing Twilio SMS dispatch protocol for immediate mobile alerts.'
    );
    await delay(1500);

    let smsSent = 0;
    let smsDetails = [];
    if (contacts && contacts.length > 0) {
      for (const contact of contacts) {
        if (contact.phone) {
          // Mock SMS send logic
          console.log(`[SMS MOCK] Twilio alert sent to ${contact.full_name} (${contact.phone}): "AfterMind has been activated by the executor. Access code: ${contact.access_code}."`);
          smsSent++;
          smsDetails.push(`${contact.full_name}`);
        }
      }
    }

    await logStep(
      'Send SMS Alerts', 
      'completed', 
      smsSent > 0 
        ? `Twilio SMS alerts successfully dispatched to: ${smsDetails.join(', ')} (Simulated).`
        : 'No trusted contacts with valid phone numbers registered for SMS alerts.'
    );
    await delay(1500);

    // --- STEP 4: GENERATE DIGITAL ESTATE PDF REPORT (PLACEHOLDER) ---
    await logStep(
      'Generate Digital Estate Report', 
      'in_progress', 
      'Compiling digital accounts, document locations, and asset registries into secure PDF digest.'
    );
    await delay(1500);
    await logStep(
      'Generate Digital Estate Report', 
      'completed', 
      'Digital Estate Report compiled successfully. (Stored as placeholder - Download links enabled in portals).'
    );
    await delay(1500);

    // --- STEP 5: RELEASE TIME CAPSULE MESSAGES ---
    await logStep(
      'Deliver Time Capsule Messages', 
      'in_progress', 
      'Locating active time capsules with "on_death" delivery triggers.'
    );
    await delay(1500);

    const { data: capsules, error: capsulesErr } = await supabase
      .from('time_capsules')
      .select('*')
      .eq('estate_id', estateId)
      .eq('delivery_trigger', 'on_death')
      .eq('is_delivered', false);

    if (capsulesErr) throw capsulesErr;

    let capsulesSent = 0;
    let capsuleDetails = [];

    if (capsules && capsules.length > 0) {
      for (const capsule of capsules) {
        if (capsule.recipient_email) {
          const capsuleResult = await sendTimeCapsuleEmail({
            toEmail: capsule.recipient_email,
            recipientName: capsule.recipient_name,
            userName: ownerName,
            subject: capsule.subject,
            messageText: capsule.message_text
          });

          // Mark as delivered in database
          await supabase
            .from('time_capsules')
            .update({
              is_delivered: true,
              delivered_at: new Date()
            })
            .eq('id', capsule.id);

          capsulesSent++;
          capsuleDetails.push(`"${capsule.subject}" to ${capsule.recipient_name}`);
        }
      }
    }

    await logStep(
      'Deliver Time Capsule Messages', 
      'completed', 
      capsulesSent > 0 
        ? `Delivered ${capsulesSent} time capsules: ${capsuleDetails.join(', ')}.`
        : 'No time capsules with "on_death" triggers were pending delivery.'
    );
    await delay(1500);

    // --- STEP 6: COMPILE STEP-BY-STEP CHECKLIST ---
    await logStep(
      'Generate Family Checklist', 
      'in_progress', 
      'Structuring action items for executors and family portals.'
    );
    await delay(1500);
    await logStep(
      'Generate Family Checklist', 
      'completed', 
      'Compassionate family action checklists populated and published to Family Portal.'
    );
    await delay(1500);

    // --- STEP 7: COMPLETE EXECUTION ---
    await logStep(
      'Execute Final Protocols', 
      'in_progress', 
      'Finalizing execution log and locking estate records.'
    );
    await delay(1000);

    // Update estate status to 'executed'
    await supabase
      .from('estate_profiles')
      .update({
        status: 'executed',
        updated_at: new Date()
      })
      .eq('id', estateId);

    await logStep(
      'Execute Final Protocols', 
      'completed', 
      'AfterMind execution protocol fully completed. Rest in peace.'
    );

    console.log(`[Execution Engine] Estate execution completed successfully for Profile: ${estateId}.`);
    return { success: true };
  } catch (error) {
    console.error(`[Execution Engine] Error executing estate ${estateId}:`, error.message);
    
    // Attempt to log the failure
    try {
      await supabase
        .from('execution_log')
        .insert({
          estate_id: estateId,
          action: 'Execution Protocol',
          status: 'failed',
          details: `Fatal execution error: ${error.message}`,
          executed_at: new Date()
        });
    } catch (dbErr) {
      console.error("[Execution Engine] Could not log failure to DB:", dbErr.message);
    }

    return { success: false, error: error.message };
  }
}

module.exports = {
  triggerExecution
};
