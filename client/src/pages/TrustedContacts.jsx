import React, { useState } from 'react';
import useEstate from '../hooks/useEstate';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { Users, Plus, X, Trash2, Key, Info, Copy, Check } from 'lucide-react';

export default function TrustedContacts() {
  const { contacts, addContact, removeContact } = useEstate();
  const [composing, setComposing] = useState(false);
  const [copiedCode, setCopiedCode] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [relationship, setRelationship] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('family');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name) return;
    setSaving(true);
    setError(null);

    try {
      await addContact({
        full_name: name,
        relationship,
        email,
        phone,
        role
      });
      // Clear forms
      setName('');
      setRelationship('');
      setEmail('');
      setPhone('');
      setRole('family');
      setComposing(false);
    } catch (err) {
      setError(err.message || "Failed to add trusted contact.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex-1 bg-transparent p-6 md:p-12 space-y-8 max-w-7xl mx-auto w-full page-entrance">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#D4A853]/20 pb-6">
        <div>
          <h1 className="font-display text-4xl md:text-[56px] font-bold text-white flex items-center gap-2.5 leading-tight">
            <Users size={36} className="text-amber animate-logo-pulse" />
            <span>Trusted Contacts</span>
          </h1>
          <p className="font-sans text-sm text-[#FAF7F2]/80 mt-1.5">
            Designate the people you trust to receive your messages and act as executors.
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
              <span>Add Contact</span>
            </div>
          )}
        </Button>
      </div>

      {/* Info Notice about Roles (Premium Dark Card Look) */}
      <div className="bg-black/50 border border-[#D4A853]/35 rounded-xl p-5 flex gap-4 text-xs font-sans text-[#FAF7F2] shadow-premium animate-fade-in-up">
        <Info size={24} className="text-[#D4A853] flex-shrink-0 mt-0.5 animate-logo-pulse" />
        <div className="space-y-2">
          <p className="font-display text-sm font-bold text-[#D4A853] tracking-wide">
            Role Permissions & Secure Execution Keys
          </p>
          <ul className="list-disc pl-4 space-y-1 font-sans italic text-[#FAF7F2]/90 leading-relaxed">
            <li><strong className="text-white font-semibold">Executors</strong> hold the legal digital activation keys. Only they can input their secure access code in the Family Portal to trigger the AfterMind execution protocol.</li>
            <li><strong className="text-white font-semibold">Family / Recipient</strong> contacts receive legacy emails and time capsule letters upon execution, but do not have activation capabilities.</li>
          </ul>
        </div>
      </div>

      {/* Slide-out Drawer Overlay Form */}
      {composing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end transition-all duration-300">
          <div className="absolute inset-0" onClick={() => setComposing(false)} />
          <div className="w-full max-w-md bg-[#0D0A07]/95 border-l border-[#D4A853]/20 p-8 shadow-premium h-full flex flex-col gap-6 overflow-y-auto animate-slide-left-fade relative z-10">
            <button 
              onClick={() => setComposing(false)}
              className="absolute top-4 right-4 text-[#E8D5B7]/60 hover:text-white p-1.5 hover:bg-white/10 rounded-full cursor-pointer animate-logo-pulse"
            >
              <X size={18} />
            </button>
            
            <div>
              <h3 className="font-display text-2xl font-bold text-white">Add Trusted Contact</h3>
              <p className="font-sans text-xs text-[#E8D5B7]/80 mt-0.5">Designate a family member or executor to hold a secure legacy key.</p>
            </div>

            {error && <div className="bg-red-955 border border-red-800 text-red-200 text-xs p-2.5 rounded mb-3">{error}</div>}
            
            <form onSubmit={handleSubmit} className="space-y-5 font-sans text-xs">
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#E8D5B7]">Contact Full Name *</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sarah Jenkins"
                  className="py-2.5 px-3 rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#E8D5B7]">Relationship</label>
                <input 
                  type="text" 
                  value={relationship}
                  onChange={(e) => setRelationship(e.target.value)}
                  placeholder="e.g. Spouse, Brother, Cousin"
                  className="py-2.5 px-3 rounded-lg text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#E8D5B7]">Email Address</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="sarah@example.com"
                  className="py-2.5 px-3 rounded-lg text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#E8D5B7]">Phone Number</label>
                <input 
                  type="text" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="py-2.5 px-3 rounded-lg text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-semibold text-[#E8D5B7]">Role Badge</label>
                <select 
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="py-2.5 px-3 rounded-lg text-sm w-full"
                >
                  <option value="family" className="bg-[#0D0A07] text-white">Immediate Family</option>
                  <option value="executor" className="bg-[#0D0A07] text-white">Executor (Has activation rights)</option>
                  <option value="trusted_friend" className="bg-[#0D0A07] text-white">Trusted Friend</option>
                </select>
              </div>

              <Button type="submit" loading={saving} className="w-full justify-center btn-primary-premium py-3.5 rounded-xl font-bold shadow-sm">
                Save Contact & Generate Key
              </Button>
            </form>
          </div>
        </div>
      )}

      {/* Grid of Contacts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {contacts.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center border border-dashed border-[#D4A853]/25 rounded-2xl bg-white/5 shadow-soft max-w-lg mx-auto animate-fade-in-up">
            <div className="w-16 h-16 mb-4 flex items-center justify-center bg-[#D4A853]/10 rounded-full border border-[#D4A853]/25 animate-logo-pulse text-[#C17D3C]">
              <Users size={32} className="animate-flame" />
            </div>
            <h4 className="font-display text-xl font-bold text-white">No Trusted Contacts Designation</h4>
            <p className="font-sans text-sm text-[#E8D5B7]/80 max-w-sm mt-2 leading-relaxed">
              Designate your trusted family members or executors to manage your estate legacy. Add at least one Executor to hold the activation keys.
            </p>
          </div>
        ) : (
          contacts.map((contact) => (
            <Card 
              key={contact.id} 
              className="glass-card p-5 hover:-translate-y-2 hover:scale-[1.005] transition-all duration-300 relative group flex flex-col justify-between gap-4"
            >
              {/* Delete trigger */}
              <button
                onClick={() => removeContact(contact.id)}
                className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#E8D5B7]/60 hover:text-red-400 transition-opacity p-1.5 hover:bg-white/10 rounded-full z-20 cursor-pointer"
                title="Remove Contact"
              >
                <Trash2 size={14} />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#C17D3C] flex items-center justify-center text-white font-bold text-sm shadow-sm flex-shrink-0 border border-white/25">
                  {contact.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                </div>
                <div>
                  <h4 className="font-display text-base font-bold text-white leading-tight">{contact.full_name}</h4>
                  <p className="font-sans text-xs text-[#E8D5B7]/80 mt-0.5">{contact.relationship || 'Contact'}</p>
                </div>
              </div>

              <div className="space-y-1.5 font-sans text-xs text-[#E8D5B7]/80 mt-2 pl-1 border-t border-white/10 pt-3">
                <div className="flex justify-between">
                  <span className="text-[#E8D5B7]/60 font-medium">Role:</span>
                  <span className={`text-[9px] uppercase font-sans font-bold px-2 py-0.5 rounded-full border shadow-sm ${
                    contact.role === 'executor' 
                      ? 'bg-[#D4A853]/15 text-[#D4A853] border-[#D4A853]/35' 
                      : 'bg-amber/15 text-amber border-amber/25'
                  }`}>
                    {contact.role === 'executor' ? 'Executor' : 'Recipient'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E8D5B7]/60 font-medium">Email:</span>
                  <span className="text-white font-semibold">{contact.email || 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#E8D5B7]/60 font-medium">Phone:</span>
                  <span className="text-white font-semibold">{contact.phone || 'None'}</span>
                </div>
              </div>

              {/* Secure Access Code Footer */}
              <div className="border-t border-white/10 pt-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-mono bg-black/40 px-3 py-1.5 rounded-full border border-white/10 w-full justify-between text-[#FAF7F2] shadow-inner">
                  <div className="flex items-center gap-1.5">
                    <Key size={12} className="text-[#D4A853]" />
                    <span className="text-[#D4A853] font-semibold">{contact.access_code}</span>
                  </div>
                  <button 
                    onClick={() => handleCopy(contact.access_code)}
                    className="text-[#E8D5B7]/60 hover:text-[#D4A853] hover:scale-110 transition-all p-0.5 cursor-pointer"
                    title="Copy Access Code"
                  >
                    {copiedCode === contact.access_code ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
