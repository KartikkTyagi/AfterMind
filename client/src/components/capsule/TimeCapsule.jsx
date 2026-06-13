import React from 'react';
import { Mail, Calendar, Trash2, Flame } from 'lucide-react';
import Card from '../ui/Card';

export default function TimeCapsule({ 
  capsule, 
  onDelete 
}) {
  const getTriggerText = () => {
    if (capsule.delivery_trigger === 'on_death') {
      return "Upon AfterMind Activation";
    } else if (capsule.delivery_trigger === 'on_date') {
      return `On Date: ${new Date(capsule.delivery_date).toLocaleDateString()}`;
    } else {
      return `Occasion: "${capsule.delivery_event}"`;
    }
  };

  return (
    <Card className="glass-card p-6 hover:-translate-y-2 hover:scale-[1.01] transition-all duration-300 relative group flex flex-col justify-between gap-5 overflow-hidden min-h-[220px]">
      
      {/* Decorative Envelope diagonal background flaps */}
      <div className="absolute inset-0 border border-[#D4A853]/10 rounded-xl pointer-events-none" />
      
      {/* Left and Right inner folds of the back of the envelope */}
      <div className="absolute top-0 left-0 w-0 h-0 border-t-[100px] border-t-transparent border-b-[100px] border-b-transparent border-l-[110px] border-l-[#D4A853]/5 pointer-events-none" />
      <div className="absolute top-0 right-0 w-0 h-0 border-t-[100px] border-t-transparent border-b-[100px] border-b-transparent border-r-[110px] border-r-[#D4A853]/5 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-0 border-b-[90px] border-b-[#D4A853]/5 border-l-[150px] border-l-transparent border-r-[150px] border-r-transparent pointer-events-none" />

      {/* Red Wax Seal Monogram in the middle */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-gradient-to-br from-[#A72B2B] via-[#8B1A1A] to-[#601010] border border-[#D4A853]/60 shadow-[0_4px_10px_rgba(0,0,0,0.25)] flex items-center justify-center z-10 pointer-events-none transition-transform group-hover:scale-110 duration-300">
        <Flame size={12} className="text-[#D4A853] animate-pulse" />
      </div>

      {/* Delete button (visible on hover) */}
      <button
        onClick={() => onDelete(capsule.id)}
        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#E8D5B7]/60 hover:text-red-400 transition-opacity p-1.5 hover:bg-white/10 rounded-full z-20 cursor-pointer"
        title="Delete capsule"
      >
        <Trash2 size={14} />
      </button>

      {/* Envelope Contents */}
      <div className="space-y-3 z-0 pr-6 relative">
        <div className="flex justify-between items-start">
          <span className={`px-2.5 py-0.5 rounded-full border text-[9px] uppercase font-bold shadow-sm ${
            capsule.is_delivered 
              ? 'bg-green-950/40 text-green-300 border-green-800/40' 
              : 'bg-[#D4A853]/10 text-[#D4A853] border-[#D4A853]/25'
          }`}>
            {capsule.is_delivered ? 'Delivered' : 'Vaulted'}
          </span>
        </div>
        
        <div>
          <h4 className="font-display text-lg font-bold text-white">To: {capsule.recipient_name}</h4>
          {capsule.recipient_email && (
            <p className="font-sans text-[11px] text-[#E8D5B7]/80">{capsule.recipient_email}</p>
          )}
        </div>
        
        <div className="text-xs font-sans font-semibold text-white/95 italic pl-1 truncate max-w-full">
          Subject: "{capsule.subject}"
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between border-t border-white/10 pt-3 text-[10px] font-sans text-[#E8D5B7]/70 z-0 relative">
        <div className="flex items-center gap-1.5 font-semibold text-[#E8D5B7]/80">
          <Calendar size={12} className="text-[#D4A853]" />
          <span>{getTriggerText()}</span>
        </div>
      </div>
    </Card>
  );
}
