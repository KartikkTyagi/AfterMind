import React, { useState } from 'react';
import { Mail, Calendar, MessageSquareQuote, Heart, X } from 'lucide-react';
import Card from '../ui/Card';
import Modal from '../ui/Modal';

export default function MessageVault({ messages = [], ownerName = "Your Loved One" }) {
  const [selectedMessage, setSelectedMessage] = useState(null);

  return (
    <div className="space-y-4 animate-fade-in-up">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center p-8 border border-dashed border-cream rounded-xl bg-cream/10">
          <Mail size={32} className="text-muted-rose/40 mb-2" />
          <span className="font-serif text-sm text-muted-rose italic">
            There are no messages vault registered specifically for you.
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {messages.map((msg) => (
            <Card 
              key={msg.id}
              hoverable
              onClick={() => setSelectedMessage(msg)}
              className="border-[#E6DEC9] p-5 flex flex-col justify-between gap-3 relative paper-texture"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="bg-amber/10 p-2 rounded-full text-amber">
                    <Heart size={14} className="fill-amber animate-pulse" />
                  </div>
                  <div>
                    <h4 className="font-sans text-sm font-semibold text-deep-brown">Message from {ownerName}</h4>
                    <span className="text-[10px] text-muted-rose block">Prepared with love</span>
                  </div>
                </div>
                <div className="text-xs font-sans font-medium italic text-deep-brown mt-1">
                  "{msg.subject || 'A Letter from the Heart'}"
                </div>
                <p className="font-serif italic text-xs text-deep-brown/75 line-clamp-2 mt-2 bg-cream/15 p-2 rounded border border-cream/35">
                  "{msg.message_text}"
                </p>
              </div>
              
              <div className="flex items-center justify-between border-t border-cream/50 pt-3 text-[10px] font-sans text-muted-rose">
                <span className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>Delivered on Death Activation</span>
                </span>
                <span className="text-xs font-serif font-bold text-amber hover:underline">
                  Read Letter &rarr;
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Expanded Letter View Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-deep-brown/40 backdrop-blur-sm" onClick={() => setSelectedMessage(null)} />
          
          <div className="bg-[#FAF7F2] border border-[#E6DEC9] rounded-xl shadow-premium w-full max-w-lg relative z-10 p-8 max-h-[90vh] overflow-y-auto font-serif text-deep-brown leading-relaxed paper-texture animate-fade-in-up">
            
            {/* Close Button */}
            <button 
              onClick={() => setSelectedMessage(null)}
              className="absolute top-4 right-4 text-muted-rose hover:text-deep-brown transition-colors"
            >
              <X size={20} />
            </button>

            {/* Letter Head */}
            <div className="border-b border-cream pb-4 mb-6 text-center">
              <span className="font-display font-bold text-xl text-warm-brown flex items-center justify-center gap-1.5">
                🕯️ AfterMind Message Vault
              </span>
              <span className="text-[10px] text-muted-rose uppercase font-sans tracking-widest block mt-1">
                A personal letter from {ownerName}
              </span>
            </div>

            {/* Letter Content */}
            <div className="space-y-4 font-serif text-deep-brown leading-relaxed text-sm">
              <div className="font-sans text-xs text-muted-rose/85">
                Subject: <span className="italic font-serif text-deep-brown font-semibold">"{selectedMessage.subject}"</span>
              </div>

              <div className="border-t border-cream/50 pt-4 whitespace-pre-wrap italic font-serif leading-loose text-deep-brown/95 text-base bg-cream/10 p-4 rounded border border-cream/30">
                {selectedMessage.message_text}
              </div>

              <div className="border-t border-cream pt-4 mt-6 text-center text-[10px] font-sans text-muted-rose/80">
                <div className="flex justify-center items-center gap-1">
                  <Heart size={10} className="fill-muted-rose text-muted-rose" />
                  <span>Prepared thoughtfully by {ownerName}. Delivered autonomously by AfterMind.</span>
                </div>
                <div className="mt-1">"Some things are too important to leave to chance."</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
