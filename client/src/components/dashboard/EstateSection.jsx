import React from 'react';
import { Plus, Trash2, Link2, FileText, Award, Copy, Check } from 'lucide-react';
import Button from '../ui/Button';

export default function EstateSection({
  title,
  description,
  type, // 'accounts' | 'documents' | 'assets' | 'contacts' | 'capsules'
  items = [],
  onAddClick,
  onDeleteClick,
  emptyMessage = "Nothing recorded yet. Start adding details to secure this category."
}) {
  const [copiedCode, setCopiedCode] = React.useState(null);

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const getActionColor = (action) => {
    switch (action) {
      case 'delete': return 'bg-red-950/40 text-red-300 border-red-800/50';
      case 'cancel': return 'bg-amber-950/40 text-amber-300 border-amber-800/50';
      case 'transfer': return 'bg-blue-950/40 text-blue-300 border-blue-800/50';
      case 'memorialize': return 'bg-purple-950/40 text-purple-300 border-purple-800/50';
      default: return 'bg-white/5 text-[#E8D5B7] border-white/10';
    }
  };

  return (
    <div className="glass-card border-l-4 border-l-[#D4A853] p-6 hover:-translate-y-1 hover:scale-[1.002] transition-all duration-300 flex flex-col gap-4 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-[#D4A853]/20 pb-4">
        <div>
          <h3 className="font-display text-xl font-bold text-white">{title}</h3>
          <p className="font-sans text-xs text-[#E8D5B7]/70 mt-0.5">{description}</p>
        </div>
        <Button 
          onClick={onAddClick}
          className="py-1.5 px-4 text-xs font-sans font-bold btn-secondary-premium rounded-lg flex items-center gap-1.5 cursor-pointer transition-all"
        >
          <Plus size={14} />
          <span>Add Item</span>
        </Button>
      </div>

      {/* List Content */}
      <div className="flex flex-col gap-3 min-h-[100px]">
        {items.length === 0 ? (
          <div className="flex items-center justify-center py-8 px-4 text-center border border-dashed border-[#D4A853]/25 rounded-lg bg-white/5">
            <span className="font-sans text-sm text-[#E8D5B7]/60">
              {emptyMessage}
            </span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => (
              <div 
                key={item.id} 
                className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between gap-3 shadow-sm hover:border-[#D4A853]/55 hover:-translate-y-1 hover:scale-[1.02] transition-all duration-300 relative group cursor-pointer"
              >
                {/* Delete Button (visible on hover) */}
                <button
                  onClick={() => onDeleteClick(item.id)}
                  className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 text-[#E8D5B7]/60 hover:text-red-400 transition-opacity p-1.5 hover:bg-white/10 rounded-full cursor-pointer"
                  title="Remove Item"
                >
                  <Trash2 size={15} />
                </button>

                {/* Categories Specific Rendering */}
                {type === 'accounts' && (
                  <div>
                    <div className="flex items-center gap-2 pr-6">
                      <span className="bg-amber/10 p-1.5 rounded text-amber">
                        <Link2 size={14} />
                      </span>
                      <h4 className="font-sans text-sm font-semibold text-white">{item.platform}</h4>
                    </div>
                    {item.account_email && (
                      <p className="font-sans text-xs text-[#E8D5B7]/80 mt-1 pl-8">{item.account_email}</p>
                    )}
                    <div className="flex items-center gap-2 mt-3 pl-8">
                      <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 border rounded-full ${getActionColor(item.action)}`}>
                        {item.action}
                      </span>
                      {item.notes && (
                        <span className="font-sans text-[11px] text-[#E8D5B7]/60 italic truncate max-w-[150px]">
                          — {item.notes}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {type === 'documents' && (
                  <div>
                    <div className="flex items-center gap-2 pr-6">
                      <span className="bg-soft-gold/15 p-1.5 rounded text-soft-gold">
                        <FileText size={14} />
                      </span>
                      <h4 className="font-sans text-sm font-semibold text-white">{item.document_name}</h4>
                    </div>
                    <div className="mt-2 pl-8 text-xs font-sans">
                      <span className="text-[#E8D5B7]/60">Location:</span>{' '}
                      <span className="font-sans italic text-white">"{item.location_description || 'Not specified'}"</span>
                    </div>
                    <div className="mt-1.5 pl-8">
                      <span className="text-[10px] uppercase font-sans font-semibold bg-white/5 text-[#E8D5B7]/80 px-2 py-0.5 rounded border border-white/10">
                        {item.document_type}
                      </span>
                    </div>
                  </div>
                )}

                {type === 'assets' && (
                  <div>
                    <div className="flex items-center gap-2 pr-6">
                      <span className="bg-amber/10 p-1.5 rounded text-amber">
                        <Award size={14} />
                      </span>
                      <h4 className="font-sans text-sm font-semibold text-white">{item.institution}</h4>
                    </div>
                    <p className="font-sans text-xs text-[#E8D5B7]/80 mt-1 pl-8">{item.description}</p>
                    <div className="mt-3 pl-8 flex flex-col gap-1 text-[11px] font-sans text-[#E8D5B7]/80">
                      <div>
                        Recipient: <strong className="text-white font-semibold">{item.designated_recipient || 'Estate beneficiaries'}</strong>
                      </div>
                      <div className="text-[10px] bg-white/5 px-1.5 py-0.5 rounded border border-white/10 truncate max-w-full inline-block w-fit">
                        {item.asset_type.toUpperCase()}
                      </div>
                    </div>
                  </div>
                )}

                {type === 'contacts' && (
                  <div>
                    <div className="flex items-center justify-between pr-6">
                      <h4 className="font-sans text-sm font-semibold text-white">{item.full_name}</h4>
                      <span className="text-[10px] uppercase font-sans font-bold bg-[#D4A853]/20 text-[#D4A853] px-2 py-0.5 rounded-full">
                        {item.role}
                      </span>
                    </div>
                    <p className="font-sans text-xs text-[#E8D5B7]/80 mt-1">{item.relationship}</p>
                    <div className="mt-3 text-[11px] font-sans text-[#E8D5B7]/80 flex flex-col gap-1 border-t border-white/10 pt-2">
                      <div>Email: <span className="text-white">{item.email || 'None'}</span></div>
                      <div>Phone: <span className="text-white">{item.phone || 'None'}</span></div>
                      
                      {/* Access Code Box */}
                      <div className="mt-1.5 flex items-center justify-between bg-black/40 p-1.5 rounded border border-white/10 text-[11px] font-mono text-[#D4A853]">
                        <span className="font-semibold">{item.access_code}</span>
                        <button 
                          onClick={() => handleCopy(item.access_code)}
                          className="text-[#E8D5B7]/60 hover:text-[#D4A853] transition-colors ml-1 p-0.5 cursor-pointer"
                          title="Copy Access Code"
                        >
                          {copiedCode === item.access_code ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
