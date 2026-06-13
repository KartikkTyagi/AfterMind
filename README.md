markdown# 🕯️ AfterMind — Autonomous Digital Estate Agent



> "Some things are too important to leave to chance."



AfterMind is an autonomous digital estate agent built for the Far Away Hackathon 2026 (Agentic \& Autonomous Systems theme). It helps people prepare their digital afterlife while alive, and autonomously executes their final digital wishes after they pass away.



\## 🌍 Problem Statement



When someone dies, their digital life becomes chaos. Families struggle with:

\- Active subscriptions still charging

\- Inaccessible accounts and passwords

\- Missing documents and assets

\- No guidance on what to do next



AfterMind solves this completely.



\## ✨ Key Features



\- \*\*AI Setup Conversation\*\* — Natural chat with Claude AI to build your Digital Estate Profile

\- \*\*Autonomous Executor\*\* — Triggers automatically when activated by trusted contact

\- \*\*Time Capsule Messages\*\* — Personal letters delivered to loved ones at the right moment

\- \*\*Family Portal\*\* — Step-by-step guidance for grieving families

\- \*\*Real Email Notifications\*\* — Actual emails sent via Gmail SMTP



\## 🛠️ Tech Stack



\- \*\*Frontend:\*\* React.js, Tailwind CSS, Vite

\- \*\*Backend:\*\* Node.js, Express.js

\- \*\*Database:\*\* Supabase (PostgreSQL)

\- \*\*AI:\*\* Anthropic Claude API

\- \*\*Email:\*\* Nodemailer + Gmail SMTP

\- \*\*Auth:\*\* Supabase Auth + JWT



\## 🚀 Setup Instructions



\### Prerequisites

\- Node.js v18+

\- A Supabase account

\- Anthropic API key

\- Gmail account with App Password



\### Installation



1\. Clone the repository:

git clone https://github.com/KartikkTyagi/AfterMind.git



cd AfterMind



2\. Install backend dependencies:

cd server



npm install



3\. Install frontend dependencies:

cd ../client



npm install



4\. Create `server/.env` file:

ANTHROPIC\_API\_KEY=your\_anthropic\_key



SUPABASE\_URL=your\_supabase\_url



SUPABASE\_ANON\_KEY=your\_anon\_key



SUPABASE\_SERVICE\_KEY=your\_service\_key



GMAIL\_USER=your\_gmail



GMAIL\_APP\_PASSWORD=your\_app\_password



PORT=3001



CLIENT\_URL=http://localhost:5173



JWT\_SECRET=your\_secret



5\. Run the backend:

cd server



node index.js



6\. Run the frontend:

cd client



npm run dev



7\. Open browser at `http://localhost:5173`



\## 🎯 Demo Flow



1\. Land on the homepage and sign up

2\. Complete the AI setup conversation

3\. Add trusted contacts and time capsule messages

4\. Simulate activation via Family Portal

5\. Watch autonomous execution in real time



\## 👨‍💻 Built By



Kartik Tyagi — Solo participant, Far Away Hackathon 2026

