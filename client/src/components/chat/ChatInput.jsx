import React, { useState, useRef, useEffect } from 'react';
import { Send, Flame } from 'lucide-react';

export default function ChatInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Begin your gentle conversation with AfterMind..." 
}) {
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea height as user types
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(140, textareaRef.current.scrollHeight)}px`;
    }
  }, [text]);

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Typing Indicator */}
      {disabled && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs font-sans text-amber font-semibold animate-pulse">
          <Flame size={12} className="text-amber animate-bounce" />
          <span>AfterMind is crafting a thoughtful response...</span>
          <div className="flex gap-1 ml-1">
            <span className="w-1.5 h-1.5 bg-amber rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <span className="w-1.5 h-1.5 bg-amber rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <span className="w-1.5 h-1.5 bg-amber rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* Input Box Form */}
      <form 
        onSubmit={handleSubmit} 
        className="flex gap-3 items-end bg-white/5 border border-white/10 rounded-xl p-3 shadow-soft focus-within:border-[#D4A853] focus-within:bg-white/10 focus-within:shadow-[0_0_15px_rgba(193,125,60,0.15)] transition-all duration-300"
      >
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="flex-grow flex-1 resize-none bg-transparent outline-none max-h-36 py-2 px-3 text-sm font-sans text-white placeholder-white/40 disabled:opacity-50 chat-input-textarea"
        />
        <button
          type="submit"
          disabled={disabled || !text.trim()}
          className="btn-primary-premium text-white p-3 rounded-full disabled:opacity-35 disabled:hover:scale-100 hover:scale-110 hover:shadow-[0_0_12px_rgba(193,125,60,0.5)] transition-all flex items-center justify-center cursor-pointer flex-shrink-0"
        >
          <Send size={15} />
        </button>
      </form>
    </div>
  );
}
