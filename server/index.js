const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { supabase } = require('./utils/helpers');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS setup
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if the origin matches localhost or 127.0.0.1 on any port
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    
    if (isLocalhost || origin === clientUrl) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body parser middleware
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Verify Supabase Connection
async function checkDatabaseConnection() {
  try {
    const { data, error } = await supabase.from('estate_profiles').select('id').limit(1);
    if (error) {
      console.warn("[Database] Warning: Connection check failed or table 'estate_profiles' not ready. Check Supabase setup. Error:", error.message);
    } else {
      console.log("[Database] Supabase connection check successful. 'estate_profiles' table active.");
    }
  } catch (err) {
    console.error("[Database] Fatal connection error:", err.message);
  }
}
checkDatabaseConnection();

// Mount Routes
const authRouter = require('./routes/auth');
const estateRouter = require('./routes/estate');
const chatRouter = require('./routes/chat');
const executorRouter = require('./routes/executor');
const capsuleRouter = require('./routes/capsule');
const familyRouter = require('./routes/family');

app.use('/api/auth', authRouter);
app.use('/api', estateRouter); // Handles /estate/:id, /accounts, /documents, /assets, /contacts
app.use('/api/chat', chatRouter);
app.use('/api/executor', executorRouter);
app.use('/api/capsules', capsuleRouter);
app.use('/api/family', familyRouter);

// Generates and downloads a clean, printable HTML report of the estate data
app.get('/api/reports/generate/:estateId', async (req, res) => {
  const { estateId } = req.params;
  const { token, code } = req.query;

  let authorized = false;
  let accessorName = "";

  try {
    // 1. Verify Authorization
    if (token) {
      try {
        const jwt = require('jsonwebtoken');
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'aftermind_super_secret_jwt_2026');
        if (decoded.estateId === estateId) {
          authorized = true;
          accessorName = "Estate Owner";
        }
      } catch (err) {
        console.warn("Report Auth: Invalid token passed");
      }
    }

    if (code) {
      const { data: contact } = await supabase
        .from('trusted_contacts')
        .select('*')
        .eq('access_code', code.trim())
        .single();
      if (contact && contact.estate_id === estateId) {
        authorized = true;
        accessorName = `${contact.full_name} (${contact.relationship || contact.role})`;
      }
    }

    if (!authorized) {
      return res.status(401).send("<html><body style='font-family: Georgia, serif; background-color: #FAF7F2; color: #2C1810; padding: 40px; text-align: center;'><h1>Access Denied</h1><p>You do not have credentials to view this secure digital estate report.</p></body></html>");
    }

    // 2. Fetch all estate details
    const [estate, accounts, documents, assets, contacts] = await Promise.all([
      supabase.from('estate_profiles').select('*').eq('id', estateId).single(),
      supabase.from('digital_accounts').select('*').eq('estate_id', estateId),
      supabase.from('documents').select('*').eq('estate_id', estateId),
      supabase.from('financial_assets').select('*').eq('estate_id', estateId),
      supabase.from('trusted_contacts').select('*').eq('estate_id', estateId)
    ]);

    if (estate.error || !estate.data) {
      return res.status(404).send("<h1>Estate Profile Not Found</h1>");
    }

    const profile = estate.data;
    const accountsList = accounts.data || [];
    const docsList = documents.data || [];
    const assetsList = assets.data || [];
    const contactsList = contacts.data || [];

    // 3. Compile beautiful printable HTML response
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>AfterMind Estate Report — ${profile.full_name}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Lora:ital,wght@0,400;0,700;1,400&family=Playfair+Display:wght@700&display=swap');
          
          body {
            font-family: 'Lora', Georgia, serif;
            background-color: #ffffff;
            color: #2C1810;
            margin: 0;
            padding: 40px 30px;
            line-height: 1.6;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          header {
            border-bottom: 2px solid #2C1810;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
          }
          .logo {
            font-family: 'Playfair Display', serif;
            font-size: 28px;
            font-weight: bold;
            color: #6B3F2A;
          }
          .logo span {
            font-size: 22px;
          }
          .report-meta {
            font-family: 'DM Sans', sans-serif;
            font-size: 11px;
            text-align: right;
            color: #6B3F2A;
            text-transform: uppercase;
            letter-spacing: 1px;
          }
          h1 {
            font-family: 'Playfair Display', serif;
            font-size: 32px;
            margin: 0 0 10px 0;
            color: #2C1810;
          }
          h2 {
            font-family: 'Playfair Display', serif;
            font-size: 20px;
            color: #6B3F2A;
            border-bottom: 1px solid #E6DEC9;
            padding-bottom: 6px;
            margin-top: 40px;
            margin-bottom: 15px;
          }
          .intro {
            font-style: italic;
            color: #6B3F2A;
            background-color: #FAF7F2;
            border: 1px solid #E6DEC9;
            padding: 15px;
            border-radius: 6px;
            margin-bottom: 30px;
            font-size: 14px;
          }
          .field-grid {
            display: grid;
            grid-template-cols: 1fr 1fr;
            gap: 15px;
            margin-bottom: 30px;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
          }
          .field {
            border-bottom: 1px dashed #E6DEC9;
            padding-bottom: 5px;
          }
          .field-label {
            font-weight: bold;
            color: #6B3F2A;
            margin-right: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 25px;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
          }
          th {
            background-color: #FAF7F2;
            border-bottom: 2px solid #6B3F2A;
            color: #2C1810;
            text-align: left;
            padding: 10px;
            font-weight: bold;
          }
          td {
            border-bottom: 1px solid #FAF7F2;
            padding: 12px 10px;
            vertical-align: top;
          }
          tr:nth-child(even) td {
            background-color: #FAF7F2/30;
          }
          .badge {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: bold;
            padding: 2px 8px;
            border-radius: 12px;
            border: 1px solid #E6DEC9;
            background-color: #ffffff;
            display: inline-block;
          }
          .badge-delete { background-color: #FEE2E2; color: #991B1B; border-color: #FCA5A5; }
          .badge-cancel { background-color: #FEF3C7; color: #92400E; border-color: #FCD34D; }
          .badge-transfer { background-color: #DBEAFE; color: #1E40AF; border-color: #93C5FD; }
          .badge-memorialize { background-color: #F3E8FF; color: #6B21A8; border-color: #D8B4FE; }
          
          .footer {
            text-align: center;
            font-family: 'DM Sans', sans-serif;
            font-size: 11px;
            color: #C4957A;
            margin-top: 60px;
            border-top: 1px solid #E6DEC9;
            padding-top: 20px;
          }
          .print-btn {
            background-color: #C17D3C;
            color: #FAF7F2;
            border: none;
            padding: 10px 20px;
            font-family: 'DM Sans', sans-serif;
            font-size: 13px;
            font-weight: bold;
            border-radius: 4px;
            cursor: pointer;
            margin-bottom: 20px;
            transition: background 0.3s;
          }
          .print-btn:hover {
            background-color: #6B3F2A;
          }
          @media print {
            .print-btn {
              display: none;
            }
            body {
              padding: 0;
              background-color: #ffffff;
            }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div style="text-align: right;">
            <button class="print-btn" onclick="window.print()">Print Report</button>
          </div>
          <header>
            <div>
              <div class="logo">🕯️ AfterMind</div>
              <div style="font-family: 'DM Sans', sans-serif; font-size: 12px; color: #6B3F2A; margin-top: 4px;">Digital Estate Registry</div>
            </div>
            <div class="report-meta">
              Generated On: ${new Date().toLocaleDateString()}<br>
              Accessor: ${accessorName}
            </div>
          </header>

          <h1>Digital Estate Report</h1>
          <div class="intro">
            This document contains a consolidated record of the digital afterlife wishes, file locations, assets, and contacts compiled by <strong>${profile.full_name}</strong>. It serves as a guide for executors and immediate family.
          </div>

          <div class="field-grid">
            <div class="field"><span class="field-label">Full Name:</span> ${profile.full_name}</div>
            <div class="field"><span class="field-label">Date of Birth:</span> ${profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'Not recorded'}</div>
            <div class="field"><span class="field-label">Completeness:</span> ${profile.completion_percentage}%</div>
            <div class="field"><span class="field-label">Status:</span> ${profile.status.toUpperCase()}</div>
          </div>

          <h2>Digital Accounts & Subscriptions</h2>
          ${accountsList.length === 0 ? '<p>No digital accounts registered.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Platform</th>
                  <th>Account Email</th>
                  <th>Wished Action</th>
                  <th>Instructions / Notes</th>
                </tr>
              </thead>
              <tbody>
                ${accountsList.map(a => `
                  <tr>
                    <td><strong>${a.platform}</strong></td>
                    <td>${a.account_email || '—'}</td>
                    <td><span class="badge badge-${a.action}">${a.action}</span></td>
                    <td>${a.notes || '—'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <h2>Important Document Locations</h2>
          ${docsList.length === 0 ? '<p>No document locations registered.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Document Name</th>
                  <th>Storage Location Description</th>
                </tr>
              </thead>
              <tbody>
                ${docsList.map(d => `
                  <tr>
                    <td><span class="badge">${d.document_type}</span></td>
                    <td><strong>${d.document_name}</strong></td>
                    <td>${d.location_description}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <h2>Financial Assets & Portfolios</h2>
          ${assetsList.length === 0 ? '<p>No financial assets registered.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Institution</th>
                  <th>Description</th>
                  <th>Designated Recipient</th>
                </tr>
              </thead>
              <tbody>
                ${assetsList.map(as => `
                  <tr>
                    <td><span class="badge">${as.asset_type}</span></td>
                    <td><strong>${as.institution}</strong></td>
                    <td>${as.description || '—'}</td>
                    <td>${as.designated_recipient || 'Estate beneficiaries'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <h2>Trusted Contacts & Executors</h2>
          ${contactsList.length === 0 ? '<p>No trusted contacts registered.</p>' : `
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Relationship</th>
                  <th>Contact Info</th>
                  <th>Role</th>
                  <th>Family Portal Code</th>
                </tr>
              </thead>
              <tbody>
                ${contactsList.map(c => `
                  <tr>
                    <td><strong>${c.full_name}</strong></td>
                    <td>${c.relationship || '—'}</td>
                    <td>
                      Email: ${c.email || '—'}<br>
                      Phone: ${c.phone || '—'}
                    </td>
                    <td><span class="badge ${c.role === 'executor' ? 'badge-cancel' : ''}">${c.role}</span></td>
                    <td><code style="font-family: monospace; font-weight: bold; font-size: 13px;">${c.access_code}</code></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}

          <div class="footer">
            "Some things are too important to leave to chance."<br>
            AfterMind Estate Services © 2026. Prepared with respect.
          </div>
        </div>
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(html);

  } catch (err) {
    console.error("Report generation error:", err);
    return res.status(500).send("<h1>Server Error</h1><p>Failed to generate report.</p>");
  }
});

// Root check endpoint
app.get('/', (req, res) => {
  res.json({ message: 'AfterMind Autonomous Estate Agent API active.' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("[Server Error]", err.stack);
  res.status(500).json({ message: 'Something went wrong on the server.' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`🕯️ AfterMind server is running on port ${PORT}`);
});
