import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import ChatMessage from '../chat/ChatMessage';
import ChatInput from '../chat/ChatInput';
import { Sparkles, MessageSquare, AlertCircle } from 'lucide-react';

export default function FamilyPortalGuide({ accessCode, ownerName = "Your Loved One" }) {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  
  const messagesEndRef = useRef(null);

  // Set initial greeting
  useEffect(() => {
    setMessages([
      {
        id: 'initial',
        role: 'assistant',
        content: `Hello. I am the AfterMind Family Guide. I am here to assist you with warmth and clarity as you navigate ${ownerName}'s digital estate wishes. \n\nI have access to the profile details they prepared. You can ask me questions like:\n- "Where is the insurance document stored?"\n- "What did they wish to do with Netflix?"\n- "Who is listed as the executor?"\n\nHow can I help you today?`
      }
    ]);
  }, [ownerName]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, sending]);

  const handleSend = async (text) => {
    if (!text.trim()) return;
    setSending(true);
    setError(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMsg]);

    try {
      // Send chat request to Family Guide API (which uses Claude)
      const chatHistory = messages.map(m => ({ role: m.role, content: m.content }));
      const result = await api.family.chat(accessCode, text, chatHistory);

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        created_at: new Date().toISOString()
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error("[Family Guide Chat] Error:", err.message);
      setError("Failed to get response from the guide. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[550px] bg-warm-white border border-[#E6DEC9] rounded-xl overflow-hidden shadow-soft animate-fade-in-up">
      {/* Header */}
      <div className="bg-[#FAF7F2] border-b border-cream py-4 px-6 flex items-center gap-2">
        <div className="bg-amber/10 p-1.5 rounded-full text-amber">
          <MessageSquare size={16} />
        </div>
        <div>
          <h3 className="font-display text-base font-bold text-deep-brown">AfterMind Compassionate AI Guide</h3>
          <span className="text-[10px] text-muted-rose block">Answers questions regarding {ownerName}'s wishes</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 bg-cream/10">
        {messages.map((msg) => (
          <ChatMessage key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-warm-white border-t border-cream">
        {error && (
          <div className="text-red-700 bg-red-50 border border-red-200 px-3 py-1.5 rounded-lg text-xs font-sans mb-2 flex items-center gap-1">
            <AlertCircle size={12} />
            <span>{error}</span>
          </div>
        )}
        <ChatInput 
          onSend={handleSend} 
          disabled={sending} 
          placeholder="Ask about documents, accounts, or executor tasks..." 
        />
      </div>
    </div>
  );
}
