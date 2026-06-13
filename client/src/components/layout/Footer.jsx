import React, { useState } from 'react';
import { Flame, X } from 'lucide-react';

export default function Footer() {
  const [activeModal, setActiveModal] = useState(null);

  const openPrivacyModal = (e) => {
    e.preventDefault();
    setActiveModal('privacy');
  };

  const openSecurityModal = (e) => {
    e.preventDefault();
    setActiveModal('security');
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  return (
    <footer className="bg-warm-white border-t border-cream/80 py-8 px-6 md:px-12 mt-auto">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        {/* Logo and Tagline */}
        <div className="flex flex-col gap-1.5 items-center md:items-start">
          <div className="flex items-center gap-2">
            <Flame className="text-muted-rose w-4 h-4" />
            <span className="font-display font-bold text-deep-brown text-sm tracking-wide">
              AfterMind
            </span>
          </div>
          <p className="font-serif italic text-xs text-muted-rose">
            "Some things are too important to leave to chance."
          </p>
        </div>

        {/* Links and Copyright */}
        <div className="flex flex-col md:flex-row items-center gap-4 text-xs font-sans text-muted-rose">
          <div className="flex gap-4">
            <button 
              onClick={openPrivacyModal} 
              className="hover:text-deep-brown transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-sans text-muted-rose font-medium outline-none"
            >
              Privacy Charter
            </button>
            <button 
              onClick={openSecurityModal} 
              className="hover:text-deep-brown transition-colors cursor-pointer bg-transparent border-none p-0 text-xs font-sans text-muted-rose font-medium outline-none"
            >
              Security Protocol
            </button>
          </div>
          <span className="hidden md:inline text-cream">|</span>
          <p>© 2026 AfterMind Estate Services. Prepared with respect for the Far Away Hackathon.</p>
        </div>
      </div>

      {/* Modal Overlay and Content */}
      {activeModal && (
        <div 
          className="fixed inset-0 bg-deep-brown/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 transition-all duration-300"
          onClick={closeModal}
        >
          <div 
            className="bg-warm-white max-w-lg w-full rounded-2xl p-6 md:p-8 border border-cream/80 shadow-premium relative text-left transition-all duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button 
              onClick={closeModal}
              className="absolute top-4 right-4 text-muted-rose hover:text-deep-brown transition-colors cursor-pointer bg-transparent border-none p-1 outline-none"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            {/* Privacy Charter Modal Content */}
            {activeModal === 'privacy' && (
              <>
                <h3 className="font-display font-bold text-2xl text-deep-brown mb-4 tracking-wide">
                  Our Privacy Charter
                </h3>
                <div className="font-serif text-sm text-warm-brown leading-relaxed space-y-4">
                  <p>
                    AfterMind stores all your digital estate information with strict confidentiality. Your data is encrypted, never sold, never shared with third parties, and only accessible by you and the trusted contacts you explicitly designate.
                  </p>
                  <p>
                    When AfterMind is activated, only your designated executor receives access. You may delete your estate profile and all associated data at any time.
                  </p>
                </div>
              </>
            )}

            {/* Security Protocol Modal Content */}
            {activeModal === 'security' && (
              <>
                <h3 className="font-display font-bold text-2xl text-deep-brown mb-4 tracking-wide">
                  Security Protocol
                </h3>
                <div className="font-serif text-sm text-warm-brown leading-relaxed space-y-4">
                  <p>
                    AfterMind uses industry-standard JWT authentication, Row Level Security on all database tables, and unique cryptographic access codes for family portal entry. All communications are transmitted over HTTPS.
                  </p>
                  <p>
                    Executor access codes are single-purpose and tied to specific estate profiles. Your most sensitive final wishes deserve nothing less.
                  </p>
                </div>
              </>
            )}

            {/* Action Footer */}
            <div className="mt-6 pt-4 border-t border-cream/60 flex justify-end">
              <button 
                onClick={closeModal}
                className="bg-amber hover:bg-amber/95 text-warm-white font-sans text-xs font-semibold px-5 py-2.5 rounded-lg transition-all shadow-sm cursor-pointer outline-none"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
