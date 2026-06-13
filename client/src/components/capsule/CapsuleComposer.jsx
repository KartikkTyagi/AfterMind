import React, { useState } from 'react';
import { useEstate } from '../../context/EstateContext';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { Mail, Calendar, Sparkles, Send, ArrowRight } from 'lucide-react';

export default function CapsuleComposer({ onComplete }) {
  const { contacts, addCapsule } = useEstate();
  
  const [recipientType, setRecipientType] = useState('contact'); // 'contact' | 'custom'
  const [selectedContactId, setSelectedContactId] = useState('');
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  
  const [subject, setSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [trigger, setTrigger] = useState('on_death'); // 'on_death' | 'on_date' | 'on_event'
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryEvent, setDeliveryEvent] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    let recipient_name = "";
    let recipient_email = "";

    if (recipientType === 'contact') {
      const contact = contacts.find(c => c.id === selectedContactId);
      if (!contact) {
        setError("Please select a trusted contact.");
        setSaving(false);
        return;
      }
      recipient_name = contact.full_name;
      recipient_email = contact.email;
    } else {
      if (!customName || !customEmail) {
        setError("Please enter the recipient's name and email address.");
        setSaving(false);
        return;
      }
      recipient_name = customName;
      recipient_email = customEmail;
    }

    if (!messageText.trim()) {
      setError("Please write your message text.");
      setSaving(false);
      return;
    }

    try {
      await addCapsule({
        recipient_name,
        recipient_email,
        subject: subject || `A Letter from the Heart`,
        message_text: messageText,
        delivery_trigger: trigger,
        delivery_date: trigger === 'on_date' ? deliveryDate : null,
        delivery_event: trigger === 'on_event' ? deliveryEvent : null
      });
      
      // Clear fields
      setSubject('');
      setMessageText('');
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message || "Failed to vault your message.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-fade-in-up">
      {/* Form Card */}
      <Card className="glass-card p-6 flex flex-col gap-5 shadow-soft">
        <div>
          <h3 className="font-display text-xl font-bold text-white">Compose Time Capsule</h3>
          <p className="font-sans text-xs text-[#E8D5B7]/80 mt-0.5">Write a final message. We will deliver it safely when the time comes.</p>
        </div>

        {error && (
          <div className="text-red-300 bg-red-950/60 border border-red-800/40 p-3 rounded-lg text-xs font-sans">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 font-sans text-sm">
          {/* Recipient Type Selector */}
          <div className="flex gap-4 border-b border-white/10 pb-3 mb-1">
            <label className="flex items-center gap-2 cursor-pointer text-[#E8D5B7] font-semibold">
              <input 
                type="radio" 
                name="recipientType" 
                value="contact" 
                checked={recipientType === 'contact'}
                onChange={() => setRecipientType('contact')}
                className="text-[#D4A853] focus:ring-[#D4A853] bg-white/5 border-white/10"
              />
              <span>Select from Contacts</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer text-[#E8D5B7] font-semibold">
              <input 
                type="radio" 
                name="recipientType" 
                value="custom" 
                checked={recipientType === 'custom'}
                onChange={() => setRecipientType('custom')}
                className="text-[#D4A853] focus:ring-[#D4A853] bg-white/5 border-white/10"
              />
              <span>Enter Custom Email</span>
            </label>
          </div>

          {/* Recipient inputs */}
          {recipientType === 'contact' ? (
            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-[#E8D5B7]">Recipient Contact</label>
              {contacts.length === 0 ? (
                <div className="text-xs font-sans text-[#E8D5B7]/60 mt-1 bg-white/5 p-2.5 rounded border border-dashed border-white/10">
                  You have no contacts saved. Please add a contact under Trusted Contacts first, or choose 'Enter Custom Email' above.
                </div>
              ) : (
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="py-2 px-3 rounded-md w-full"
                >
                  <option value="" className="bg-[#0D0A07] text-white">-- Choose Contact --</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id} className="bg-[#0D0A07] text-white">{c.full_name} ({c.relationship || c.role})</option>
                  ))}
                </select>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#E8D5B7]">Recipient Name</label>
                <input 
                  type="text" 
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="py-2 px-3 rounded-md w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-[#E8D5B7]">Recipient Email</label>
                <input 
                  type="email" 
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="py-2 px-3 rounded-md w-full"
                />
              </div>
            </div>
          )}

          {/* Subject Line */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#E8D5B7]">Letter Subject</label>
            <input 
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. A Letter from the Heart / To my daughter"
              className="py-2 px-3 rounded-md w-full"
            />
          </div>

          {/* Letter Body */}
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#E8D5B7]">Letter Message</label>
            <textarea
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Dear..., Write your thoughts here. They will be sealed until the trigger occurs."
              rows={6}
              className="py-2.5 px-3 rounded-md w-full font-sans text-sm leading-relaxed"
            />
          </div>

          {/* Trigger selector */}
          <div className="space-y-3 bg-white/5 p-4 rounded-lg border border-white/10">
            <label className="text-xs font-bold text-[#E8D5B7] flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#D4A853]" />
              <span>Select Delivery Trigger</span>
            </label>
            <div className="flex flex-col gap-2 text-xs text-[#E8D5B7]">
              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="trigger" 
                  value="on_death"
                  checked={trigger === 'on_death'}
                  onChange={() => setTrigger('on_death')}
                  className="text-[#D4A853] focus:ring-[#D4A853] bg-white/5 border-white/10"
                />
                <span>Deliver immediately upon AfterMind activation</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="trigger" 
                  value="on_date"
                  checked={trigger === 'on_date'}
                  onChange={() => setTrigger('on_date')}
                  className="text-[#D4A853] focus:ring-[#D4A853] bg-white/5 border-white/10"
                />
                <span>Deliver on a specific future date</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input 
                  type="radio" 
                  name="trigger" 
                  value="on_event"
                  checked={trigger === 'on_event'}
                  onChange={() => setTrigger('on_event')}
                  className="text-[#D4A853] focus:ring-[#D4A853] bg-white/5 border-white/10"
                />
                <span>Deliver on a specific occasion / event</span>
              </label>
            </div>

            {trigger === 'on_date' && (
              <div className="flex flex-col gap-1 mt-2 animate-fade-in-up">
                <label className="text-[11px] font-semibold text-[#E8D5B7]/80">Choose Delivery Date</label>
                <input 
                  type="date" 
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  className="py-1.5 px-3 rounded-md text-xs w-full"
                />
              </div>
            )}

            {trigger === 'on_event' && (
              <div className="flex flex-col gap-1 mt-2 animate-fade-in-up">
                <label className="text-[11px] font-semibold text-[#E8D5B7]/80">Describe Event (e.g. My daughter's wedding)</label>
                <input 
                  type="text" 
                  value={deliveryEvent}
                  onChange={(e) => setDeliveryEvent(e.target.value)}
                  placeholder="e.g. my son's 21st birthday"
                  className="py-1.5 px-3 rounded-md text-xs w-full"
                />
              </div>
            )}
          </div>

          <Button 
            type="submit" 
            loading={saving}
            className="w-full justify-center btn-primary-premium font-bold py-3.5 rounded-xl flex items-center gap-2"
          >
            <Send size={14} />
            <span>Seal Message in Vault</span>
          </Button>
        </form>
      </Card>

      {/* Preview Card */}
      <div className="flex flex-col gap-4">
        <h4 className="font-display text-sm font-semibold uppercase tracking-wider text-[#D4A853] pl-2">Letter Preview</h4>
        <div className="glass-card p-8 font-sans text-[#E8D5B7] relative max-h-[500px] overflow-y-auto min-h-[300px]">
          {/* Flame Icon background */}
          <div className="absolute top-6 right-6 opacity-5 bg-amber/30 p-4 rounded-full">
            <Mail size={80} className="text-amber" />
          </div>

          <div className="border-b border-white/10 pb-4 mb-6 text-center">
            <span className="font-display font-bold text-lg text-[#D4A853] flex items-center justify-center gap-1.5">
              🕯️ AfterMind Message Vault
            </span>
            <span className="text-[10px] text-[#E8D5B7]/60 uppercase font-sans tracking-widest block mt-1">
              Sealed Letter
            </span>
          </div>

          <div className="space-y-4 text-sm leading-relaxed">
            <div>
              <span className="font-sans text-xs text-[#E8D5B7]/60 font-semibold block">To:</span>
              <span className="font-semibold text-sm text-white">
                {recipientType === 'contact' 
                  ? (contacts.find(c => c.id === selectedContactId)?.full_name || 'Recipient') 
                  : (customName || 'Recipient')}
              </span>
            </div>
            
            <div>
              <span className="font-sans text-xs text-[#E8D5B7]/60 font-semibold block">Subject:</span>
              <span className="italic text-sm text-white">"{subject || 'A Letter from the Heart'}"</span>
            </div>

            <div className="border-t border-white/10 pt-4 mt-4 font-sans text-sm text-[#E8D5B7] leading-relaxed min-h-[120px] whitespace-pre-wrap">
              {messageText || "Write your message in the composer to preview how it will appear to your recipient..."}
            </div>

            <div className="border-t border-white/10 pt-4 mt-6 text-center text-[10px] font-sans text-[#E8D5B7]/70 space-y-1">
              <div>Will be delivered: <strong className="text-[#D4A853]">{trigger === 'on_death' ? 'Immediately on AfterMind activation' : trigger === 'on_date' ? `On date: ${deliveryDate || 'Choose date'}` : `On occasion: "${deliveryEvent || 'Describe event'}"`}</strong></div>
              <div>"Some things are too important to leave to chance."</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
