const nodemailer = require('nodemailer');
require('dotenv').config();

const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_APP_PASSWORD = process.env.GMAIL_APP_PASSWORD;

// Helper to remove spaces from Gmail app password (Gmail app password usually formatted as 4x4 chars with spaces)
const cleanPassword = GMAIL_APP_PASSWORD ? GMAIL_APP_PASSWORD.replace(/\s+/g, '') : '';

// Create transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USER,
    pass: cleanPassword
  }
});

// Verify transporter connection
transporter.verify((error, success) => {
  if (error) {
    console.warn("[Email Service] Transporter verification failed. Email sending may fail or run in fallback/mock mode. Error:", error.message);
  } else {
    console.log("[Email Service] Server is ready to deliver notifications and capsules.");
  }
});

/**
 * Sends a welcome access code email to a trusted contact when they are registered
 */
async function sendAccessCodeEmail({ toEmail, contactName, userName, accessCode }) {
  const portalUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/family-portal`;
  
  const mailOptions = {
    from: `"AfterMind" <${GMAIL_USER}>`,
    to: toEmail,
    subject: `${userName} has named you as a trusted contact on AfterMind`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          
          body {
            font-family: 'Lora', Georgia, serif;
            background-color: #F5F0E8;
            color: #2C1810;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            background-color: #FAF7F2;
            margin: 0 auto;
            padding: 45px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(44, 24, 16, 0.05);
            border: 1px solid #E6DEC9;
          }
          .logo {
            text-align: center;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 35px;
            color: #6B3F2A;
          }
          .candle-icon {
            display: inline-block;
            font-size: 26px;
            margin-right: 10px;
          }
          h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            color: #2C1810;
            margin-bottom: 24px;
            font-weight: bold;
            line-height: 1.4;
          }
          p {
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 20px;
            color: #4A3E3D;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0;
          }
          .btn {
            background-color: #C17D3C;
            color: #FAF7F2 !important;
            text-decoration: none;
            padding: 14px 28px;
            font-family: sans-serif;
            font-size: 14px;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          }
          .code-box {
            background-color: #F5F0E8;
            border: 1px dashed #C4957A;
            padding: 16px;
            text-align: center;
            font-family: monospace;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1.5px;
            margin: 30px 0;
            border-radius: 6px;
            color: #6B3F2A;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #C4957A;
            margin-top: 45px;
            border-top: 1px solid #E6DEC9;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="candle-icon">🕯️</span>AfterMind
          </div>
          <h1>Dear ${contactName},</h1>
          <p>This email is to notify you that <strong>${userName}</strong> has designated you as a trusted contact on AfterMind.</p>
          <p>AfterMind is an autonomous digital estate agent that helps people prepare their digital afterlife wishes while they are alive and executes them when the time comes.</p>
          <p>For your security and authentication, a unique access code has been generated for you. Please keep this code safe and confidential. It should only be used when the time comes to access their estate wishes, locate documents, manage accounts, and unlock personal messages.</p>
          
          <div class="code-box">
            Access Code: ${accessCode}
          </div>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">View Family Portal Preview</a>
          </div>

          <p>With warm regards,<br>The AfterMind Team</p>
          
          <div class="footer">
            "Some things are too important to leave to chance."<br>
            © 2026 AfterMind Estate Services
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Access code email sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send access code email to ${toEmail}:`, err.message);
    return { success: false, error: err.message, mocked: true };
  }
}

/**
 * Sends notification email to trusted contact when estate is triggered
 */
async function sendNotificationEmail({ toEmail, contactName, userName, accessCode }) {
  const portalUrl = `${process.env.CLIENT_URL || 'http://localhost:5174'}/family-portal`;
  
  const mailOptions = {
    from: `"AfterMind" <${GMAIL_USER}>`,
    to: toEmail,
    subject: `AfterMind has been activated — ${userName} has left something for you`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          
          body {
            font-family: 'Lora', Georgia, serif;
            background-color: #F5F0E8;
            color: #2C1810;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            background-color: #FAF7F2;
            margin: 0 auto;
            padding: 45px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(44, 24, 16, 0.05);
            border: 1px solid #E6DEC9;
          }
          .logo {
            text-align: center;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 35px;
            color: #6B3F2A;
          }
          .candle-icon {
            display: inline-block;
            font-size: 26px;
            margin-right: 10px;
          }
          h1 {
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 24px;
            color: #2C1810;
            margin-bottom: 24px;
            font-weight: bold;
            line-height: 1.4;
          }
          p {
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 20px;
            color: #4A3E3D;
          }
          .btn-container {
            text-align: center;
            margin: 35px 0;
          }
          .btn {
            background-color: #C17D3C;
            color: #FAF7F2 !important;
            text-decoration: none;
            padding: 14px 28px;
            font-family: sans-serif;
            font-size: 14px;
            border-radius: 6px;
            font-weight: bold;
            display: inline-block;
          }
          .code-box {
            background-color: #F5F0E8;
            border: 1px dashed #C4957A;
            padding: 16px;
            text-align: center;
            font-family: monospace;
            font-size: 20px;
            font-weight: bold;
            letter-spacing: 1.5px;
            margin: 30px 0;
            border-radius: 6px;
            color: #6B3F2A;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #C4957A;
            margin-top: 45px;
            border-top: 1px solid #E6DEC9;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="candle-icon">🕯️</span>AfterMind
          </div>
          <h1>Dear ${contactName},</h1>
          <p>We are writing to inform you that AfterMind has been activated on behalf of <strong>${userName}</strong>.</p>
          <p>${userName} prepared their digital estate profile thoughtfully, ensuring that their wishes are honored and their digital legacy is protected. You are receiving this because they listed you as a trusted contact.</p>
          <p>Please visit the Family Portal and enter your unique access code below to retrieve their instructions, locate important papers, manage subscriptions, and unlock any personal messages they left for you.</p>
          
          <div class="code-box">
            Access Code: ${accessCode}
          </div>

          <div class="btn-container">
            <a href="${portalUrl}" class="btn">Access the Family Portal</a>
          </div>

          <p>With warm regards,<br>The AfterMind Team</p>
          
          <div class="footer">
            "Some things are too important to leave to chance."<br>
            © 2026 AfterMind Estate Services
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Activation notification sent to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to send activation email to ${toEmail}:`, err.message);
    return { success: false, error: err.message, mocked: true };
  }
}

/**
 * Sends a delivered Time Capsule email message to a recipient
 */
async function sendTimeCapsuleEmail({ toEmail, recipientName, userName, subject, messageText }) {
  const mailOptions = {
    from: `"AfterMind Message Vault" <${GMAIL_USER}>`,
    to: toEmail,
    subject: subject || `A message from ${userName} via AfterMind`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
          
          body {
            font-family: 'Lora', Georgia, serif;
            background-color: #F5F0E8;
            color: #2C1810;
            margin: 0;
            padding: 40px 20px;
          }
          .container {
            max-width: 600px;
            background-color: #FAF7F2;
            margin: 0 auto;
            padding: 45px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(44, 24, 16, 0.05);
            border: 1px solid #E6DEC9;
          }
          .logo {
            text-align: center;
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 32px;
            font-weight: bold;
            margin-bottom: 35px;
            color: #6B3F2A;
          }
          .candle-icon {
            display: inline-block;
            font-size: 26px;
            margin-right: 10px;
          }
          .letter-card {
            background-color: #FAF7F2;
            border: 1px solid #E6DEC9;
            padding: 30px;
            border-radius: 8px;
            font-size: 16px;
            line-height: 1.8;
            color: #2C1810;
            white-space: pre-line;
            box-shadow: inset 0 0 10px rgba(44, 24, 16, 0.02);
            margin-bottom: 25px;
          }
          .salutation {
            font-weight: bold;
            margin-bottom: 15px;
          }
          .intro-banner {
            background-color: #E6DEC9;
            color: #6B3F2A;
            padding: 12px;
            text-align: center;
            font-size: 14px;
            border-radius: 6px;
            margin-bottom: 30px;
            font-style: italic;
          }
          p {
            font-size: 15px;
            line-height: 1.7;
            margin-bottom: 20px;
            color: #4A3E3D;
          }
          .footer {
            text-align: center;
            font-size: 11px;
            color: #C4957A;
            margin-top: 45px;
            border-top: 1px solid #E6DEC9;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <span class="candle-icon">🕯️</span>AfterMind Message Vault
          </div>
          
          <div class="intro-banner">
            A message from <strong>${userName}</strong>, prepared with love.
          </div>

          <div class="letter-card">
            <div class="salutation">Dear ${recipientName},</div>
            ${messageText}
          </div>

          <p>This message was composed by <strong>${userName}</strong> while they were alive, with instructions to deliver it to you at this moment.</p>
          
          <div class="footer">
            "Some things are too important to leave to chance."<br>
            © 2026 AfterMind Estate Services
          </div>
        </div>
      </body>
      </html>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[Email Service] Time capsule delivered to ${toEmail}. MessageId: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[Email Service] Failed to deliver time capsule to ${toEmail}:`, err.message);
    return { success: false, error: err.message, mocked: true };
  }
}

module.exports = {
  sendAccessCodeEmail,
  sendNotificationEmail,
  sendTimeCapsuleEmail
};
