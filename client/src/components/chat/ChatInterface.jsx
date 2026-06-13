import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useEstate } from '../../context/EstateContext';
import useChat from '../../hooks/useChat';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { ShieldCheck, Flame, ArrowDown, Award, FileCheck, CircleAlert } from 'lucide-react';

export default function ChatInterface() {
  const { user } = useAuth();
  const { estateProfile, accounts, documents, assets, contacts, capsules, refreshEstateData } = useEstate();
  const { messages, sending, error, loadHistory, sendMessage } = useChat();
  const [extractionAlert, setExtractionAlert] = useState(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    if (user?.estate_id) {
      loadHistory(user.estate_id);
    }
  }, [user?.estate_id, loadHistory]);

  // Smooth scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (text) => {
    try {
      const res = await sendMessage(text);
      if (res && res.extracted) {
        // Refresh estate context data immediately
        refreshEstateData();

        // Display animated notification when data is extracted
        const extractedType = res.extracted.type;
        let alertName = "Estate Item";
        if (extractedType === 'digital_account') alertName = `Digital Account (${res.extracted.data.platform})`;
        else if (extractedType === 'document') alertName = `Document Location (${res.extracted.data.document_name})`;
        else if (extractedType === 'financial_asset') alertName = `Financial Asset (${res.extracted.data.institution})`;
        else if (extractedType === 'trusted_contact') alertName = `Executor (${res.extracted.data.full_name})`;
        else if (extractedType === 'time_capsule') alertName = `Time Capsule message to ${res.extracted.data.recipient_name}`;
        
        setExtractionAlert(alertName);
        setTimeout(() => setExtractionAlert(null), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Determine which categories are populated
  const hasAccounts = accounts.length > 0;
  const hasDocuments = documents.length > 0;
  const hasAssets = assets.length > 0;
  const hasContacts = contacts.length > 0;
  const hasCapsules = capsules.length > 0;

  const totalCompleted = (hasAccounts ? 20 : 0) + 
                         (hasDocuments ? 20 : 0) + 
                         (hasAssets ? 20 : 0) + 
                         (hasContacts ? 20 : 0) + 
                         (hasCapsules ? 20 : 0);

  return (
    <div className="flex-1 flex flex-col md:flex-row max-h-[calc(100vh-73px)] h-[calc(100vh-73px)] w-full relative">
      {/* Extraction Notification Overlay */}
      {extractionAlert && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-amber border border-soft-gold text-warm-white px-5 py-3 rounded-full shadow-premium flex items-center gap-2.5 z-50 animate-fade-in-up font-sans text-xs font-semibold">
          <Award size={16} className="animate-spin" />
          <span>Extracted: {extractionAlert} added to estate profile!</span>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-grow flex flex-col justify-between bg-transparent p-4 md:p-6 overflow-hidden page-entrance">
        {/* Messages Container */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto space-y-4 pr-2 scroll-smooth flex flex-col"
        >
          {messages.length === 0 ? (
            <div className="my-auto text-center max-w-md mx-auto space-y-4 animate-fade-in-up px-4">
              <div className="bg-[#D4A853]/25 p-4 rounded-full w-fit mx-auto border border-[#D4A853]/35 shadow-md animate-logo-pulse">
                <Flame size={32} className="text-white animate-flame" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">Begin Your AfterMind Journey</h3>
              <p className="font-sans text-sm leading-relaxed text-[#E8D5B7]/85">
                Preparing your digital wishes is a profound gesture of love. Let's take it one gentle step at a time. What digital accounts or subscriptions would you like to document first?
              </p>
            </div>
          ) : (
            <div className="space-y-4 pb-2 mt-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {sending && (
                <div className="flex items-start gap-3 w-full animate-slide-left-fade justify-start">
                  <div className="bg-[#D4A853]/25 p-2 rounded-full flex-shrink-0 mt-0.5 shadow-md flex items-center justify-center border border-[#D4A853]/35 animate-logo-pulse">
                    <Flame size={15} className="text-white animate-flame" />
                  </div>
                  <div className="bg-white/5 text-[#E8D5B7] rounded-r-2xl rounded-bl-2xl rounded-tl-none border-l-[3px] border-l-[#D4A853] border-t border-r border-b border-white/10 px-5 py-3.5 shadow-soft max-w-[80%] flex items-center gap-1.5 h-11">
                    <div className="w-2 h-2 rounded-full bg-amber dot-wave-1"></div>
                    <div className="w-2 h-2 rounded-full bg-amber dot-wave-2"></div>
                    <div className="w-2 h-2 rounded-full bg-amber dot-wave-3"></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="pt-4 bg-transparent">
          {error && (
            <div className="text-red-300 bg-red-950/60 border border-red-800/40 px-4 py-2 rounded-lg text-xs font-sans mb-2 flex items-center gap-1.5 font-semibold">
              <CircleAlert size={14} />
              <span>{error}</span>
            </div>
          )}
          <ChatInput onSend={handleSend} disabled={sending} />
        </div>
      </div>

      {/* Real-time Onboarding Progress Sidebar */}
      <div className="w-full md:w-80 bg-black/45 backdrop-blur-md border-t md:border-t-0 md:border-l border-[#D4A853]/15 p-6 flex flex-col justify-between gap-6 overflow-y-auto page-entrance text-white z-10">
        <div className="space-y-6">
          <div>
            <h3 className="font-display text-lg font-bold text-[#D4A853]">Profile Progress</h3>
            <p className="font-sans text-xs text-[#E8D5B7]/75 mt-0.5">Watch your profile expand as we talk.</p>
          </div>

          {/* Large Ring Progress */}
          <div className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/10 shadow-premium">
            <div className="relative flex items-center justify-center w-16 h-16 flex-shrink-0">
              <svg className="w-16 h-16 transform -rotate-90">
                <circle cx="32" cy="32" r="26" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="4" fill="transparent" className="opacity-50" />
                <circle 
                  cx="32" 
                  cy="32" 
                  r="26" 
                  stroke="#D4A853" 
                  strokeWidth="4" 
                  strokeDasharray={2 * Math.PI * 26} 
                  strokeDashoffset={2 * Math.PI * 26 - (totalCompleted / 100) * (2 * Math.PI * 26)} 
                  strokeLinecap="round" 
                  fill="transparent" 
                  className="transition-all duration-1000 ease-out" 
                />
              </svg>
              <span className="absolute font-sans text-sm font-bold text-[#D4A853]">{totalCompleted}%</span>
            </div>
            <div>
              <h4 className="font-sans text-sm font-semibold text-[#D4A853]">Completeness</h4>
              <p className="font-sans text-[11px] text-[#E8D5B7]/60 mt-0.5">5 target categories total.</p>
            </div>
          </div>

          {/* Categories List */}
          <div className="space-y-3.5 font-sans text-xs">
            
            {/* Accounts */}
            <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-300 ${hasAccounts ? 'bg-white/5 border-[#D4A853]/30 text-white shadow-premium' : 'bg-transparent border-white/5 text-[#E8D5B7]/40'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={16} className={hasAccounts ? 'text-[#D4A853] animate-logo-pulse' : 'text-white/10'} />
                <div>
                  <div className="font-semibold text-white">Digital Accounts</div>
                  <div className="text-[10px] text-[#E8D5B7]/75 font-sans mt-0.5">{hasAccounts ? `${accounts.length} platforms saved` : 'Pending setup'}</div>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="bg-[#D4A853] h-full transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: hasAccounts ? '100%' : '0%' }}
                />
              </div>
            </div>

            {/* Documents */}
            <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-300 ${hasDocuments ? 'bg-white/5 border-[#D4A853]/30 text-white shadow-premium' : 'bg-transparent border-white/5 text-[#E8D5B7]/40'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={16} className={hasDocuments ? 'text-[#D4A853] animate-logo-pulse' : 'text-white/10'} />
                <div>
                  <div className="font-semibold text-white">Important Documents</div>
                  <div className="text-[10px] text-[#E8D5B7]/75 font-sans mt-0.5">{hasDocuments ? `${documents.length} document locations` : 'Pending setup'}</div>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="bg-[#D4A853] h-full transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: hasDocuments ? '100%' : '0%' }}
                />
              </div>
            </div>

            {/* Assets */}
            <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-300 ${hasAssets ? 'bg-white/5 border-[#D4A853]/30 text-white shadow-premium' : 'bg-transparent border-white/5 text-[#E8D5B7]/40'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={16} className={hasAssets ? 'text-[#D4A853] animate-logo-pulse' : 'text-white/10'} />
                <div>
                  <div className="font-semibold text-white">Financial Assets</div>
                  <div className="text-[10px] text-[#E8D5B7]/75 font-sans mt-0.5">{hasAssets ? `${assets.length} institutions recorded` : 'Pending setup'}</div>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="bg-[#D4A853] h-full transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: hasAssets ? '100%' : '0%' }}
                />
              </div>
            </div>

            {/* Contacts */}
            <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-300 ${hasContacts ? 'bg-white/5 border-[#D4A853]/30 text-white shadow-premium' : 'bg-transparent border-white/5 text-[#E8D5B7]/40'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={16} className={hasContacts ? 'text-[#D4A853] animate-logo-pulse' : 'text-white/10'} />
                <div>
                  <div className="font-semibold text-white">Trusted Contacts</div>
                  <div className="text-[10px] text-[#E8D5B7]/75 font-sans mt-0.5">{hasContacts ? 'Designated Executor saved' : 'Pending setup'}</div>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="bg-[#D4A853] h-full transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: hasContacts ? '100%' : '0%' }}
                />
              </div>
            </div>

            {/* Capsules */}
            <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-all duration-300 ${hasCapsules ? 'bg-white/5 border-[#D4A853]/30 text-white shadow-premium' : 'bg-transparent border-white/5 text-[#E8D5B7]/40'}`}>
              <div className="flex items-center gap-3">
                <FileCheck size={16} className={hasCapsules ? 'text-[#D4A853] animate-logo-pulse' : 'text-white/10'} />
                <div>
                  <div className="font-semibold text-white">Time Capsules</div>
                  <div className="text-[10px] text-[#E8D5B7]/75 font-sans mt-0.5">{hasCapsules ? `${capsules.length} messages written` : 'Pending setup'}</div>
                </div>
              </div>
              <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mt-0.5">
                <div 
                  className="bg-[#D4A853] h-full transition-all duration-1000 ease-out rounded-full" 
                  style={{ width: hasCapsules ? '100%' : '0%' }}
                />
              </div>
            </div>

          </div>
        </div>

        <div className="border-t border-white/10 pt-4 text-center">
          <span className="font-sans text-xs text-[#E8D5B7]/50">
            AfterMind Digital Estate Advisor
          </span>
        </div>
      </div>
    </div>
  );
}
