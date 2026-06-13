import React from 'react';
import { Flame } from 'lucide-react';

export default function ChatMessage({ message }) {
  const isAssistant = message.role === 'assistant';

  return (
    <div className={`flex items-start gap-3 w-full ${isAssistant ? 'justify-start animate-slide-left-fade' : 'justify-end animate-slide-right-fade'}`}>
      {/* Assistant Avatar */}
      {isAssistant && (
        <div className="bg-[#D4A853]/25 p-2 rounded-full flex-shrink-0 mt-0.5 shadow-md flex items-center justify-center border border-[#D4A853]/35 animate-logo-pulse">
          <Flame size={15} className="text-white animate-flame" />
        </div>
      )}

      {/* Bubble */}
      <div 
        className={`
          max-w-[80%] 
          md:max-w-[70%] 
          px-5 
          py-3.5 
          text-sm 
          leading-relaxed 
          font-sans
          transition-all
          duration-300
          ${isAssistant 
            ? 'bg-white/5 backdrop-blur-md text-white rounded-r-2xl rounded-bl-2xl rounded-tl-none border-l-4 border-l-[#D4A853] border-t border-r border-b border-white/10 shadow-premium' 
            : 'bg-gradient-to-r from-[#C17D3C] to-[#D4A853] text-white rounded-l-2xl rounded-br-2xl rounded-tr-none shadow-premium hover:shadow-[0_4px_15px_rgba(193,125,60,0.3)]'
          }
        `}
      >
        <p className="whitespace-pre-line">{message.content}</p>
      </div>

      {/* User Spacer */}
      {!isAssistant && (
        <div className="w-1 flex-shrink-0" />
      )}
    </div>
  );
}
