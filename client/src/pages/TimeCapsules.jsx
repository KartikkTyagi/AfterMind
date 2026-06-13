import React, { useState } from 'react';
import useEstate from '../hooks/useEstate';
import CapsuleComposer from '../components/capsule/CapsuleComposer';
import TimeCapsule from '../components/capsule/TimeCapsule';
import Button from '../components/ui/Button';
import { Mail, Plus, X, Heart } from 'lucide-react';

export default function TimeCapsules() {
  const { capsules, removeCapsule } = useEstate();
  const [composing, setComposing] = useState(false);

  return (
    <div className="flex-1 bg-transparent p-6 md:p-12 space-y-8 max-w-7xl mx-auto w-full page-entrance">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4A853]/20 pb-6">
        <div>
          <h1 className="font-display text-4xl md:text-[56px] font-bold text-white flex items-center gap-2.5 leading-tight">
            <Heart size={36} className="text-amber fill-amber/10 animate-pulse" />
            <span>Time Capsule Vault</span>
          </h1>
          <p className="font-sans text-sm text-[#FAF7F2]/80 mt-1.5">
            Write final letters to be sealed and delivered to your loved ones at the right moment.
          </p>
        </div>

        <Button 
          onClick={() => setComposing(!composing)}
          className={`font-sans font-bold text-xs py-2.5 px-5 rounded-xl shadow-sm transition-all ${
            composing 
              ? 'btn-secondary-premium border-white/20 text-[#FAF7F2]' 
              : 'btn-primary-premium cursor-pointer'
          }`}
        >
          {composing ? (
            <div className="flex items-center gap-1.5">
              <X size={14} />
              <span>Cancel</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Plus size={14} />
              <span>Compose Message</span>
            </div>
          )}
        </Button>
      </div>

      {/* Composer Area */}
      {composing && (
        <div className="glass-card p-6 animate-fade-in-up">
          <CapsuleComposer onComplete={() => setComposing(false)} />
        </div>
      )}

      {/* Messages List Grid */}
      <div className="space-y-4">
        <h3 className="font-display text-lg font-bold text-white">Your Sealed Letters</h3>
        
        {capsules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center border border-dashed border-[#D4A853]/25 rounded-2xl bg-white/5 shadow-soft max-w-lg mx-auto">
            {/* Illustrated Envelope */}
            <div className="relative w-20 h-20 mb-6 flex items-center justify-center bg-[#D4A853]/10 rounded-full border border-[#D4A853]/25 animate-logo-pulse text-[#C17D3C]">
              <Mail size={48} className="animate-flame" />
              {/* Gold wax seal */}
              <div className="absolute w-4.5 h-4.5 rounded-full bg-amber border border-white top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center shadow-md">
                <div className="w-2 h-2 rounded-full bg-white/40" />
              </div>
            </div>
            <h4 className="font-display text-xl font-bold text-white">Your Vault is Quiet</h4>
            <p className="font-sans text-sm text-[#E8D5B7]/80 max-w-sm mt-2 leading-relaxed">
              No letters have been sealed yet. Documenting your parting thoughts or wishes for those who matter most is a profound gift. Take your time to write and lock a capsule today.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {capsules.map((capsule) => (
              <TimeCapsule 
                key={capsule.id} 
                capsule={capsule} 
                onDelete={removeCapsule} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
