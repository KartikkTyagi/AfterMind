import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import TaskChecklist from '../components/family/TaskChecklist';
import MessageVault from '../components/family/MessageVault';
import FamilyPortalGuide from '../components/family/FamilyPortal';
import { Key, Flame, ShieldAlert, Heart, Calendar, CheckCircle2, AlertCircle, Sparkles, MessageSquare, LayoutDashboard } from 'lucide-react';

export default function FamilyPortal() {
  const [accessCode, setAccessCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Verified portal states
  const [verifiedContact, setVerifiedContact] = useState(null);
  const [estateDetails, setEstateDetails] = useState(null);
  const [estateStatus, setEstateStatus] = useState(null); // 'active' | 'triggered' | 'executed'
  const [activeTab, setActiveTab] = useState('checklist'); // 'checklist' | 'vault' | 'guide'

  // Executor activation logs polling states
  const [activationConfirmed, setActivationConfirmed] = useState(false);
  const [executionLogs, setExecutionLogs] = useState([]);
  const [pollingLogs, setPollingLogs] = useState(false);

  // Poll execution logs
  const startPollingLogs = (estateId) => {
    setPollingLogs(true);
    
    const checkLogs = async () => {
      try {
        const logs = await api.executor.getLog(estateId);
        setExecutionLogs(logs || []);

        const statusRes = await api.executor.getStatus(estateId);
        if (statusRes && statusRes.status === 'executed') {
          setEstateStatus('executed');
          setPollingLogs(false);
          await fetchEstateData(accessCode);
        }
      } catch (err) {
        console.error("Error polling logs:", err);
      }
    };

    checkLogs();
    
    const interval = setInterval(async () => {
      try {
        const logs = await api.executor.getLog(estateId);
        setExecutionLogs(logs || []);

        const statusRes = await api.executor.getStatus(estateId);
        if (statusRes && statusRes.status === 'executed') {
          setEstateStatus('executed');
          setPollingLogs(false);
          clearInterval(interval);
          await fetchEstateData(accessCode);
        }
      } catch (err) {
        console.error("Error polling logs:", err);
      }
    }, 1500);

    return () => clearInterval(interval);
  };

  // Fetch full estate data
  const fetchEstateData = async (code) => {
    try {
      const data = await api.family.getEstateDetails(code);
      if (!data || !data.estate) {
        throw new Error("Invalid estate record response.");
      }
      setEstateDetails(data);
      setEstateStatus(data.estate?.status || 'active');
      
      if (data.estate?.status === 'triggered') {
        startPollingLogs(data.estate.id);
      }
      return data;
    } catch (err) {
      console.error("[Family Portal Data Fetch] Error:", err);
      throw new Error(err.message || "Failed to load estate profile records.");
    }
  };

  // Verify code & load details
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const codeToVerify = accessCode.trim();
    if (!codeToVerify) return;
    
    setLoading(true);
    setError(null);
    setVerifiedContact(null);
    setEstateDetails(null);
    setEstateStatus(null);

    try {
      // 1. Verify access code
      const res = await api.family.verifyCode(codeToVerify);
      if (!res || !res.success || !res.contact) {
        throw new Error(res?.message || "Invalid access code. Please check and try again.");
      }

      // 2. Load the estate details before rendering portal dashboard
      const details = await fetchEstateData(codeToVerify);
      
      // 3. Mark contact as verified only when data is successfully loaded
      setVerifiedContact(res.contact);
    } catch (err) {
      console.error("[Family Portal Auth] Failed:", err);
      setError(err.message || "Invalid access code or failed to retrieve estate records.");
      setVerifiedContact(null);
      setEstateDetails(null);
      setEstateStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Trigger activation protocol
  const handleActivateAfterMind = async () => {
    if (!activationConfirmed || !estateDetails?.estate?.id || !verifiedContact?.id) return;
    setLoading(true);
    setError(null);

    try {
      await api.executor.trigger(estateDetails.estate.id, verifiedContact.id);
      setEstateStatus('triggered');
      startPollingLogs(estateDetails.estate.id);
    } catch (err) {
      setError(err.message || "Failed to initialize activation protocol.");
    } finally {
      setLoading(false);
    }
  };

  // State 1: Default entry view or loading check
  if (!verifiedContact) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-transparent page-entrance">
        <div className="w-full max-w-md glass-card p-8 flex flex-col gap-5 shadow-soft">
          <div className="text-center space-y-2 mb-6">
            <div className="bg-[#D4A853]/15 p-2.5 rounded-full w-fit mx-auto border border-[#D4A853]/35 shadow-sm animate-logo-pulse">
              <Key className="text-[#D4A853] w-6 h-6 animate-flame" />
            </div>
            <h2 className="font-display text-2xl font-bold text-white">Access Family Portal</h2>
            <p className="font-sans text-xs text-[#FAF7F2]/80 mt-1">Enter your secure access code to view prepared digital wishes.</p>
          </div>

          {error && (
            <div className="text-red-300 bg-red-950/60 border border-red-800/40 p-3 rounded-lg text-xs font-sans mb-4 flex items-center gap-1.5 font-semibold">
              <AlertCircle size={14} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleVerifyCode} className="space-y-5 font-sans text-sm">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[#E8D5B7]">Portal Access Code</label>
              <input 
                type="text" 
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                placeholder="e.g. AM-XXXX-XXXX"
                required
                className="py-3 px-4 rounded-xl w-full text-center font-mono tracking-widest text-lg bg-black/50 border border-white/10 text-[#D4A853] placeholder-white/20 focus:border-[#D4A853] focus:ring-[#D4A853]/20 focus:shadow-[0_0_15px_rgba(212,168,83,0.3)] transition-all outline-none"
              />
            </div>

            <Button 
              type="submit" 
              loading={loading}
              className="w-full justify-center btn-primary-premium py-3.5 rounded-xl font-bold shadow-md cursor-pointer"
            >
              Unlock Portal
            </Button>
          </form>

          <div className="text-center text-xs font-sans text-[#E8D5B7]/65 mt-6 border-t border-white/10 pt-4">
            Looking for your code? Check your welcome email or console output.
          </div>
        </div>
      </div>
    );
  }

  // State 2: Verified but loading details (Fallback Screen)
  if (!estateDetails) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-transparent text-[#E8D5B7] font-sans page-entrance">
        <svg className="animate-spin h-8 w-8 text-[#D4A853] mb-3" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
        <span className="font-sans italic text-sm text-[#E8D5B7]/80">Loading secure estate portal...</span>
        {error && <p className="text-red-400 mt-2 text-xs">{error}</p>}
      </div>
    );
  }

  const ownerName = estateDetails.estate?.full_name || "Your Loved One";

  // State 3: Active Profile (Needs Activation Confirm)
  if (estateStatus === 'active') {
    const isExecutor = verifiedContact.role === 'executor';

    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-transparent page-entrance">
        <div className="w-full max-w-xl glass-card p-8 md:p-10 flex flex-col items-center text-center gap-6 animate-fade-in-up">
          <div className="bg-red-950/20 p-4 rounded-full border border-red-900/30 text-red-500 animate-pulse">
            <ShieldAlert size={36} />
          </div>

          <div className="space-y-2">
            <h2 className="font-display text-2xl font-bold text-white">Activate AfterMind Estate Agent</h2>
            <p className="font-sans text-xs text-[#D4A853] uppercase tracking-wider font-semibold">
              Wishes Prepared by {ownerName}
            </p>
          </div>

          <p className="font-sans text-sm text-[#E8D5B7]/90 leading-relaxed max-w-md">
            You are logged in as <strong className="text-white font-semibold">{verifiedContact.full_name}</strong> ({verifiedContact.relationship || verifiedContact.role}). 
            {isExecutor ? (
              " As the designated Executor, you hold the legal key to activate this profile. Activating will notify all contacts, release time capsules, and generate the digital transfer checklists."
            ) : (
              " You are designated as a family recipient. However, only the estate Executor holds the permission keys to activate this digital profile."
            )}
          </p>

          {isExecutor ? (
            <div className="space-y-4 w-full">
              <label className="flex items-start text-left gap-3 bg-black/45 p-4 rounded-xl border border-white/10 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={activationConfirmed}
                  onChange={(e) => setActivationConfirmed(e.target.checked)}
                  className="mt-1 text-[#D4A853] focus:ring-[#D4A853] rounded bg-[#0D0A07] border-white/15"
                />
                <span className="font-sans text-xs leading-relaxed text-[#E8D5B7]/80">
                  I solemnly confirm that <strong>{ownerName}</strong> has passed away, and I instruct AfterMind to activate their digital wishes autonomously.
                </span>
              </label>

              {error && (
                <div className="text-red-300 bg-red-955 border border-red-900/30 p-2.5 rounded text-xs text-left">
                  {error}
                </div>
              )}

              <Button 
                onClick={handleActivateAfterMind}
                disabled={!activationConfirmed}
                loading={loading}
                className="w-full justify-center btn-destructive-premium py-3.5 rounded-xl cursor-pointer"
              >
                Activate AfterMind Protocol
              </Button>
            </div>
          ) : (
            <div className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-xs font-sans text-[#E8D5B7]/70">
              Wishes cannot be activated by this login. Please contact the executor listed in the estate files to authorize deployment.
            </div>
          )}
        </div>
      </div>
    );
  }

  // State 4: Triggered status (Execution Logs in-progress)
  if (estateStatus === 'triggered' || pollingLogs) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-transparent page-entrance">
        <div className="w-full max-w-lg glass-card p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="bg-amber/10 p-3 rounded-full w-fit mx-auto border border-amber/15 shadow-sm animate-logo-pulse">
              <Flame className="text-amber w-6 h-6 animate-flame" />
            </div>
            <h2 className="font-display text-xl font-bold text-white">AfterMind Deploying Wishes...</h2>
            <p className="font-sans text-xs text-[#E8D5B7]/85">Autonomously executing {ownerName}'s digital wishes in sequence.</p>
          </div>

          <div className="bg-black/40 p-4 rounded-xl border border-white/10 h-[300px] overflow-y-auto space-y-3.5 font-sans text-xs">
            {executionLogs.length === 0 ? (
              <div className="text-center py-12 text-[#E8D5B7]/50 font-sans italic">
                Initializing communication channels...
              </div>
            ) : (
              executionLogs.map((log, idx) => (
                <div 
                  key={log.id} 
                  className="flex gap-2.5 items-start bg-white/5 p-3 rounded-lg border border-white/10 animate-slide-left-fade"
                  style={{ animationDelay: `${idx * 150}ms` }}
                >
                  {log.status === 'completed' ? (
                    <div className="w-5 h-5 flex items-center justify-center text-green-400 bg-green-500/10 rounded-full border border-green-500/20 flex-shrink-0 mt-0.5">
                      <svg className="w-3.5 h-3.5 checkmark-svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  ) : log.status === 'failed' ? (
                    <AlertCircle size={16} className="text-red-500 flex-shrink-0 mt-0.5" />
                  ) : (
                    <svg className="animate-spin h-3.5 w-3.5 text-amber flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <div>
                    <div className="font-semibold text-[#E8D5B7]">{log.action}</div>
                    <div className="font-sans text-[#FAF7F2]/80 mt-0.5 leading-relaxed">{log.details}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="text-center text-[10px] font-sans text-[#D4A853] font-semibold tracking-wider animate-pulse uppercase">
            Do not close this page. Transitioning to portal dashboard shortly...
          </div>
        </div>
      </div>
    );
  }

  // State 5: Unlocked Estate Portal (Dashboard Tabs)
  return (
    <div className="flex-1 bg-transparent text-[#E8D5B7] p-6 md:p-12 space-y-8 max-w-7xl mx-auto w-full page-entrance">
      {/* Portal Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-[#D4A853]/20 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-[#D4A853]/10 p-2 rounded-full border border-[#D4A853]/25">
            <Heart size={24} className="text-[#D4A853] fill-[#D4A853]/10" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold text-white">
              Remembering {ownerName}
            </h1>
            <p className="font-sans text-xs text-[#E8D5B7]/80">
              Digital Estate Access Portal — Authenticated Contact: {verifiedContact.full_name}
            </p>
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-black/40 backdrop-blur-md p-1 rounded-lg border border-white/10 gap-1 font-sans text-xs">
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'checklist' 
                ? 'btn-primary-premium shadow-sm' 
                : 'text-[#E8D5B7]/60 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Action Checklist</span>
          </button>
          
          <button
            onClick={() => setActiveTab('vault')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'vault' 
                ? 'btn-primary-premium shadow-sm' 
                : 'text-[#E8D5B7]/60 hover:text-white'
            }`}
          >
            <Heart size={14} />
            <span>Message Vault</span>
          </button>

          <button
            onClick={() => setActiveTab('guide')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-md font-semibold transition-all cursor-pointer ${
              activeTab === 'guide' 
                ? 'btn-primary-premium shadow-sm' 
                : 'text-[#E8D5B7]/60 hover:text-white'
            }`}
          >
            <Sparkles size={14} />
            <span>AI Family Guide</span>
          </button>
        </div>
      </div>

      {/* Main Tab Panels with dark styled container wrapper */}
      <div className="glass-card p-6 md:p-8 shadow-premium text-white">
        {activeTab === 'checklist' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Executor Instructions</h3>
              <p className="font-sans text-xs text-[#E8D5B7]/80 mt-0.5">Please coordinate step-by-step to close or transfer these files.</p>
            </div>
            
            <TaskChecklist 
              accounts={estateDetails.accounts || []} 
              documents={estateDetails.documents || []} 
              assets={estateDetails.financial_assets || []} 
              contacts={estateDetails.trusted_contacts || []} 
              estateId={estateDetails.estate?.id || null}
              accessCode={accessCode}
            />
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Your Message Vault</h3>
              <p className="font-sans text-xs text-[#E8D5B7]/80 mt-0.5">Final letters written by {ownerName} to you, sealed until now.</p>
            </div>

            <MessageVault 
              messages={estateDetails.time_capsules || []} 
              ownerName={ownerName} 
            />
          </div>
        )}

        {activeTab === 'guide' && (
          <div className="space-y-6">
            <div>
              <h3 className="font-display text-xl font-bold text-white">Compassionate Assistant</h3>
              <p className="font-sans text-xs text-[#E8D5B7]/80 mt-0.5">Ask questions to locate details, explain tasks, or find documents.</p>
            </div>

            <FamilyPortalGuide 
              accessCode={accessCode} 
              ownerName={ownerName} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
