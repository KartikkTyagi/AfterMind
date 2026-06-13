import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { Flame, MessageSquare, ShieldAlert, Award, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Onboarding() {
  const { user } = useAuth();
  
  return (
    <div className="flex-1 flex items-center justify-center p-6 warm-bg paper-texture">
      <Card className="w-full max-w-2xl border-[#E6DEC9] p-8 md:p-10 shadow-premium flex flex-col items-center text-center gap-6 animate-fade-in-up">
        {/* Animated Brand Candle */}
        <div className="bg-amber/10 p-3 rounded-full border border-amber/15 shadow-sm">
          <Flame className="text-amber w-8 h-8 candle-flicker" />
        </div>

        <div className="space-y-2">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-deep-brown">
            Welcome to AfterMind, {user?.full_name || 'Friend'}
          </h2>
          <p className="font-serif text-sm text-muted-rose max-w-md mx-auto leading-relaxed">
            You have taken a courageous and deeply caring step. Preparing your digital affairs is a beautiful gift that ensures your loved ones are never left burdened or confused.
          </p>
        </div>

        {/* Intro Checklist cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left mt-4">
          <div className="bg-cream/10 border border-cream/50 p-4 rounded-xl flex gap-3 items-start">
            <span className="bg-amber/10 text-amber p-1.5 rounded-lg flex-shrink-0">
              <MessageSquare size={16} />
            </span>
            <div>
              <h4 className="font-sans text-sm font-semibold text-deep-brown">Gentle AI Setup</h4>
              <p className="font-serif text-xs text-muted-rose mt-0.5 leading-relaxed">
                You won't fill out cold forms. Just have a warm chat, and we'll extract platform actions and documents automatically.
              </p>
            </div>
          </div>

          <div className="bg-cream/10 border border-cream/50 p-4 rounded-xl flex gap-3 items-start">
            <span className="bg-soft-gold/15 text-soft-gold p-1.5 rounded-lg flex-shrink-0">
              <Award size={16} />
            </span>
            <div>
              <h4 className="font-sans text-sm font-semibold text-deep-brown">Vaulted Messages</h4>
              <p className="font-serif text-xs text-muted-rose mt-0.5 leading-relaxed">
                Compose personal letters for family and friends. They remain sealed until your trusted contact unlocks them.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-3 w-full mt-6">
          <Link to="/setup" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto px-8 py-3.5 bg-amber hover:bg-warm-brown text-warm-white font-bold flex items-center justify-center gap-2">
              <span>Begin Setup Conversation</span>
              <ArrowRight size={16} />
            </Button>
          </Link>
          <Link to="/dashboard" className="text-xs font-sans text-muted-rose hover:text-deep-brown transition-colors">
            Or, go directly to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  );
}
