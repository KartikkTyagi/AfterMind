import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = ''
}) {
  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className={`
          glass-card
          bg-[#0D0A07]/90
          w-full 
          max-w-md 
          relative 
          z-10 
          animate-fade-in-up 
          p-6
          ${className}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D4A853]/20">
          <h3 className="font-display text-lg text-white font-semibold">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="text-[#E8D5B7]/60 hover:text-white transition-colors focus:outline-none cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
        
        {/* Body */}
        <div className="py-4 font-sans text-[#E8D5B7] text-sm leading-relaxed max-h-[70vh] overflow-y-auto pr-1">
          {children}
        </div>
      </div>
    </div>
  );
}
