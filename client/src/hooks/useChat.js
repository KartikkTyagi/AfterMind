import { useState, useCallback } from 'react';
import api from '../services/api';
import { useEstate } from '../context/EstateContext';

export default function useChat() {
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const { refreshEstateData } = useEstate();

  const loadHistory = useCallback(async (estateId) => {
    if (!estateId) return;
    setError(null);
    try {
      const history = await api.chat.getHistory(estateId);
      setMessages(history);
    } catch (err) {
      console.error("[useChat Hook] Error loading history:", err.message);
      setError("Failed to load chat history.");
    }
  }, []);

  const sendMessage = useCallback(async (text) => {
    if (!text.trim()) return;
    setSending(true);
    setError(null);

    // Append user message immediately to local state for fast UI feedback
    const tempUserMsg = {
      id: `temp-user-${Date.now()}`,
      role: 'user',
      content: text,
      created_at: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const result = await api.chat.sendMessage(text);
      
      // Append assistant message from API response
      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: result.reply,
        created_at: new Date().toISOString()
      };
      
      setMessages(prev => {
        // Remove the temporary user message and replace/append properly
        const filtered = prev.filter(m => !m.id.startsWith('temp-user-'));
        return [...filtered, { ...tempUserMsg, id: `user-${Date.now()}` }, assistantMsg];
      });

      // Trigger a dashboard completion update in background
      refreshEstateData();

      return result;
    } catch (err) {
      console.error("[useChat Hook] Error sending message:", err.message);
      setError("Failed to send message. Please try again.");
      // Remove the temp user message if it failed
      setMessages(prev => prev.filter(m => !m.id.startsWith('temp-user-')));
      throw err;
    } finally {
      setSending(false);
    }
  }, [refreshEstateData]);

  return {
    messages,
    sending,
    error,
    loadHistory,
    sendMessage,
    setMessages
  };
}
