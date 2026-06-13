import React, { useState, useEffect } from 'react';
import { ShieldCheck, FileText, Landmark, Users, Mail, CircleAlert } from 'lucide-react';

export default function CompletionMeter({ 
  percentage = 0,
  breakdown = {
    accounts: false,
    documents: false,
    assets: false,
    contacts: false,
    capsules: false
  }
}) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);

  useEffect(() => {
    const duration = 1200;
    const start = 0;
    const end = percentage;
    
    let startTime = null;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const progressPercentage = Math.min(progress / duration, 1);
      
      // Easing: easeOutQuart
      const ease = 1 - Math.pow(1 - progressPercentage, 4);
      
      setAnimatedPercentage(Math.round(start + ease * (end - start)));
      
      if (progress < duration) {
        requestAnimationFrame(animate);
      }
    }
    
    requestAnimationFrame(animate);
  }, [percentage]);

  const radius = 68; // adjusted radius to fit thicker stroke-width inside 192px viewBox
  const stroke = 16; // thicker stroke-width
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

  const categories = [
    { name: 'Digital Accounts', active: breakdown.accounts, icon: CircleAlert },
    { name: 'Important Documents', active: breakdown.documents, icon: FileText },
    { name: 'Financial Assets', active: breakdown.assets, icon: Landmark },
    { name: 'Trusted Contacts', active: breakdown.contacts, icon: Users },
    { name: 'Time Capsules', active: breakdown.capsules, icon: Mail },
  ];

  return (
    <div className="glass-card p-8 flex flex-col md:flex-row items-center justify-around gap-8">
      {/* Circle Meter */}
      <div className="relative flex items-center justify-center">
        <svg className="w-48 h-48 transform -rotate-90">
          {/* Background Ring */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={stroke}
            fill="transparent"
            className="opacity-40"
          />
          {/* Animated Foreground Ring (Gold) */}
          <circle
            cx="96"
            cy="96"
            r={radius}
            stroke="#D4A853"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Inner Labels */}
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span className="font-display text-4xl font-bold text-white">
            {animatedPercentage}%
          </span>
          <span className="font-sans text-xs text-[#D4A853] font-medium mt-0.5 tracking-wide uppercase">
            Prepared
          </span>
        </div>
      </div>

      {/* Checklist Breakdown */}
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <h4 className="font-display text-lg font-bold text-white border-b border-[#D4A853]/20 pb-2 mb-1 flex items-center gap-2">
          <ShieldCheck size={18} className="text-[#D4A853]" />
          <span>Preparation Status</span>
        </h4>
        <div className="grid grid-cols-1 gap-2.5">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <div 
                key={idx} 
                className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                  cat.active 
                    ? 'bg-white/5 border-white/10 border-l-4 border-l-[#D4A853] text-white' 
                    : 'bg-white/5 border-white/10 border-l-4 border-l-transparent text-[#E8D5B7]/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-full flex items-center justify-center flex-shrink-0 border ${
                    cat.active ? 'bg-[#D4A853]/20 text-[#D4A853] border-[#D4A853]/30' : 'bg-white/5 text-[#E8D5B7]/30 border-white/10'
                  }`}>
                    <Icon size={16} />
                  </div>
                  <span className="font-sans text-sm font-semibold">{cat.name}</span>
                </div>
                
                {/* Status indicator badge */}
                {cat.active ? (
                  <span className="font-sans text-[11px] font-bold text-white bg-amber px-2.5 py-1 rounded-full shadow-sm btn-primary-premium">
                    Saved
                  </span>
                ) : (
                  <span className="font-sans text-[11px] font-semibold text-[#E8D5B7]/50 bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                    Empty
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
