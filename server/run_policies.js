const { Client } = require('pg');
const readline = require('readline');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
if (!supabaseUrl) {
  console.error("Error: SUPABASE_URL is missing in .env file.");
  process.exit(1);
}

// Extract project reference from URL (e.g. jsvfytlnsmgkvoldhlxf)
const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
if (!match) {
  console.error("Error: Could not extract project reference from SUPABASE_URL.");
  process.exit(1);
}
const projectRef = match[1];
const host = `db.${projectRef}.supabase.co`;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Please enter your Supabase Database Password: ', (password) => {
  rl.close();
  
  if (!password) {
    console.error("Password cannot be empty.");
    process.exit(1);
  }

  const connectionString = `postgresql://postgres:${encodeURIComponent(password)}@${host}:5432/postgres`;
  
  console.log(`Connecting to database at ${host}...`);
  const client = new Client({
    connectionString: connectionString,
    ssl: { rejectUnauthorized: false }
  });

  const sqlPolicies = [
    // Drop existing policies if any to prevent duplicate errors
    'DROP POLICY IF EXISTS "Allow all operations" ON estate_profiles;',
    'DROP POLICY IF EXISTS "Allow all operations" ON digital_accounts;',
    'DROP POLICY IF EXISTS "Allow all operations" ON documents;',
    'DROP POLICY IF EXISTS "Allow all operations" ON financial_assets;',
    'DROP POLICY IF EXISTS "Allow all operations" ON trusted_contacts;',
    'DROP POLICY IF EXISTS "Allow all operations" ON time_capsules;',
    'DROP POLICY IF EXISTS "Allow all operations" ON execution_log;',
    'DROP POLICY IF EXISTS "Allow all operations" ON chat_messages;',

    // Enable RLS on all tables (in case it is disabled or we need to ensure it is set up)
    'ALTER TABLE estate_profiles ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE digital_accounts ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE documents ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE financial_assets ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE time_capsules ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE execution_log ENABLE ROW LEVEL SECURITY;',
    'ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;',

    // Create the policies
    'CREATE POLICY "Allow all operations" ON estate_profiles FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON digital_accounts FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON documents FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON financial_assets FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON trusted_contacts FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON time_capsules FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON execution_log FOR ALL USING (true) WITH CHECK (true);',
    'CREATE POLICY "Allow all operations" ON chat_messages FOR ALL USING (true) WITH CHECK (true);'
  ];

  async function execute() {
    try {
      await client.connect();
      console.log("Connected successfully! Executing DDL policies...");
      
      for (const sql of sqlPolicies) {
        console.log(`Running: ${sql.substring(0, 60)}...`);
        await client.query(sql);
      }
      
      console.log("\n🎉 All Supabase RLS policies successfully applied!");
    } catch (err) {
      console.error("\n❌ Database execution failed:", err.message);
    } finally {
      await client.end();
    }
  }

  execute();
});
