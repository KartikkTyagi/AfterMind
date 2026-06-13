import React, { useState, useEffect } from 'react';
import useEstate from '../hooks/useEstate';
import api from '../services/api';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Flame, ShieldAlert, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function ExecutionStatus() {
  const { estateProfile, refreshEstateData } = useEstate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [polling, setPolling] = useState(false);

  const fetchLogs = async () => {
    if (!estateProfile?.id) return;
    try {
      const logData = await api.executor.getLog(estateProfile.id);
      setLogs(logData);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (estateProfile?.id) {
      fetchLogs();
      if (estateProfile.status === 'triggered') {
        setPolling(true);
      }
    }
  }, [estateProfile?.id, estateProfile?.status]);

  // Logs polling loop
  useEffect(() => {
    if (!polling || !estateProfile?.id) return;

    const interval = setInterval(async () => {
      try {
        const logData = await api.executor.getLog(estateProfile.id);
        setLogs(logData);

        const statusRes = await api.executor.getStatus(estateProfile.id);
        if (statusRes.status === 'executed') {
          setPolling(false);
          clearInterval(interval);
          refreshEstateData();
        }
      } catch (err) {
        console.error(err);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [polling, estateProfile?.id, refreshEstateData]);

  const handleTestTrigger = async () => {
    if (!estateProfile?.id) return;
    setLoading(true);
    setError(null);
    try {
      // Find or use a dummy contact ID
      const contactId = '00000000-0000-0000-0000-000000000000'; // Dummy ID for owner self-activation test
      await api.executor.trigger(estateProfile.id, contactId);
      setPolling(true);
      refreshEstateData();
    } catch (err) {
      setError(err.message || "Failed to initiate test run.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 warm-bg paper-texture p-6 md:p-12 space-y-8 max-w-4xl mx-auto w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-cream pb-6">
        <div>
          <h1 className="font-display text-3xl font-bold text-deep-brown flex items-center gap-2">
            <ShieldAlert size={28} className="text-amber" />
            <span>Afterlife Agent Simulator</span>
          </h1>
          <p className="font-serif text-sm text-muted-rose italic mt-0.5">
            Monitor or test run your digital afterlife autonomous execution sequence.
          </p>
        </div>

        <Button 
          variant="secondary" 
          onClick={fetchLogs} 
          className="font-semibold text-xs border-amber/30 text-amber hover:bg-amber/5"
        >
          <RefreshCw size={13} className={polling ? 'animate-spin' : ''} />
          <span>Refresh Logs</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side Info */}
        <Card className="border-[#E6DEC9] p-6 h-fit space-y-4 md:col-span-1">
          <h3 className="font-display text-base font-bold text-deep-brown">Execution Summary</h3>
          
          <div className="space-y-3 font-sans text-xs">
            <div>
              <span className="text-muted-rose block">Estate Profile Status:</span>
              <span className={`uppercase font-bold tracking-wider ${
                estateProfile?.status === 'executed' 
                  ? 'text-green-700' 
                  : estateProfile?.status === 'triggered' 
                    ? 'text-amber animate-pulse' 
                    : 'text-deep-brown'
              }`}>
                {estateProfile?.status || 'Active'}
              </span>
            </div>

            <div>
              <span className="text-muted-rose block">Activation Mode:</span>
              <span>{estateProfile?.status === 'active' ? 'Idle (Awaiting Activation)' : 'Autonomous Deployment Engaged'}</span>
            </div>

            {estateProfile?.status === 'active' && (
              <div className="pt-4 border-t border-cream">
                <p className="font-serif italic text-xs leading-relaxed text-muted-rose mb-4">
                  For hackathon judges: you can test fire the autonomous executor directly from here to see the email, Twilio logs, and message releases compile.
                </p>
                {error && <div className="text-red-700 text-[11px] bg-red-50 p-2 rounded mb-2">{error}</div>}
                <Button 
                  onClick={handleTestTrigger}
                  loading={loading}
                  className="w-full justify-center bg-red-800 hover:bg-red-950 text-warm-white text-xs font-semibold py-2.5 rounded shadow"
                >
                  Trigger Simulator
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Right Side Logs Stream */}
        <Card className="border-[#E6DEC9] p-6 md:col-span-2 space-y-4 flex flex-col">
          <h3 className="font-display text-base font-bold text-deep-brown">Execution Log Console</h3>
          
          <div className="bg-cream/15 p-4 rounded-lg border border-cream/50 min-h-[300px] max-h-[500px] overflow-y-auto space-y-3 font-sans text-xs flex-1">
            {logs.length === 0 ? (
              <div className="text-center py-24 text-muted-rose/65 font-serif italic">
                Execution log console empty. Trigger simulation or activate via portal to stream actions.
              </div>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex gap-2.5 items-start bg-warm-white p-3 rounded border border-cream/60 shadow-sm animate-fade-in-up">
                  {log.status === 'completed' ? (
                    <CheckCircle2 size={16} className="text-green-600 flex-shrink-0 mt-0.5" />
                  ) : log.status === 'failed' ? (
                    <AlertCircle size={16} className="text-red-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <svg className="animate-spin h-3.5 w-3.5 text-amber flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  )}
                  <div>
                    <div className="font-semibold text-deep-brown">{log.action}</div>
                    <div className="font-serif italic text-muted-rose mt-0.5 leading-relaxed">{log.details}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
