import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Flame, MessageSquare, ShieldCheck, Heart, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Landing() {
  const { isAuthenticated } = useAuth();
  
  // Particles state
  const [particles, setParticles] = useState([]);
  
  // Staggered cards visibility
  const [cardsVisible, setCardsVisible] = useState(false);
  const cardsSectionRef = useRef(null);
  
  // Parallax refs
  const flameRef = useRef(null);
  const textRef = useRef(null);
  const particlesRef = useRef(null);

  // Initialize random ember particles (50 count, random sizes, durations 3-7s, delays, positions, and drift)
  useEffect(() => {
    const colors = ['#D4A853', '#C17D3C', '#F5E6C8'];
    const arr = Array.from({ length: 50 }).map((_, i) => {
      const size = Math.floor(Math.random() * 3) + 2; // 2 to 4px
      const left = Math.random() * 100; // 0 to 100%
      const top = Math.random() * 75 + 20; // start in the lower 80% to float upwards
      const delay = Math.random() * 5; // 0 to 5s
      const duration = Math.random() * 4 + 3; // 3 to 7s
      const drift = Math.floor(Math.random() * 60) - 30; // -30 to 30px drift
      const color = colors[Math.floor(Math.random() * colors.length)];
      return { id: i, size, left, top, delay, duration, drift, color };
    });
    setParticles(arr);
  }, []);

  // 60fps scroll parallax logic
  useEffect(() => {
    let requestRef = null;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      
      // Limit calculations to avoid unnecessary layout shifts
      if (scrollY < 800) {
        if (flameRef.current) {
          flameRef.current.style.transform = `translateY(${scrollY * 0.3}px) translateZ(0)`;
        }
        if (textRef.current) {
          textRef.current.style.transform = `translateY(${scrollY * 0.5}px) translateZ(0)`;
        }
        if (particlesRef.current) {
          particlesRef.current.style.transform = `translateY(${scrollY * 0.15}px) translateZ(0)`;
        }
      }
    };

    const onScroll = () => {
      requestRef = requestAnimationFrame(handleScroll);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (requestRef) cancelAnimationFrame(requestRef);
    };
  }, []);

  // IntersectionObserver for staggered feature cards reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (cardsSectionRef.current) {
      observer.observe(cardsSectionRef.current);
    }

    return () => {
      if (cardsSectionRef.current) {
        observer.disconnect();
      }
    };
  }, []);

  return (
    <div className="flex-1 flex flex-col bg-cream relative overflow-hidden">
      
      {/* 1. HERO SECTION — Dark, Cinematic Viewport */}
      <section className="relative w-full min-h-[85vh] flex flex-col items-center justify-center bg-[#0D0A07] px-6 py-20 text-center overflow-hidden border-b border-warm-brown/20">
        
        {/* Background radial glow */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none -z-10 filter blur-[120px]" 
          style={{ backgroundImage: 'radial-gradient(circle, rgba(193,125,60,0.08) 0%, transparent 70%)' }}
        />

        {/* Embers Floating Particles layer (Above background color, z-0) */}
        <div ref={particlesRef} className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden z-0">
          {particles.map((p) => (
            <div 
              key={p.id}
              className="absolute rounded-full animate-ember"
              style={{
                width: `${p.size}px`,
                height: `${p.size}px`,
                left: `${p.left}%`,
                top: `${p.top}%`,
                backgroundColor: p.color,
                '--drift': `${p.drift}px`,
                '--duration': `${p.duration}s`,
                '--delay': `${p.delay}s`
              }}
            />
          ))}
        </div>

        {/* Pure CSS flickering candle (Parallaxed) */}
        <div ref={flameRef} className="relative mb-8 transform-gpu flex flex-col items-center select-none cursor-pointer z-10 transition-transform duration-75">
          <div className="relative w-24 h-44 flex flex-col items-center justify-end">
            
            {/* Glow Halo behind the flame */}
            <div 
              className="absolute w-48 h-48 rounded-full pointer-events-none filter blur-[20px] animate-flame-glow -translate-y-[70px] mix-blend-screen" 
              style={{ backgroundImage: 'radial-gradient(circle, rgba(255,159,67,0.35) 0%, rgba(255,59,48,0.06) 60%, transparent 100%)' }}
            />
            
            {/* Teardrop Flame Wrapper (with flicker animation) */}
            <div className="absolute -translate-y-[82px] flex items-center justify-center animate-flame origin-bottom">
              {/* Outer Flame (orange-amber teardrop) */}
              <div 
                className="absolute w-9 h-9 bg-gradient-to-br from-[#FFD485] via-[#FF9F43] to-[#FF3B30] rotate-45 transform origin-center shadow-[0_0_20px_rgba(255,159,67,0.8),_0_0_40px_rgba(255,59,48,0.4)]"
                style={{ borderRadius: '0 50% 50% 50%' }}
              />
              {/* Inner Flame (white-yellow teardrop) */}
              <div 
                className="absolute w-4.5 h-4.5 bg-gradient-to-br from-[#FFFFFF] via-[#FFF275] to-[#FF9F43] rotate-45 transform origin-center"
                style={{ borderRadius: '0 50% 50% 50%' }}
              />
            </div>
            
            {/* Wick */}
            <div className="w-1 h-4 bg-[#1A1A1A] rounded-full z-20 -translate-y-[74px]" />
            
            {/* Cylindrical Candle Body in warm brown with orange glow shadow */}
            <div className="w-8 h-16 bg-gradient-to-r from-[#5c3a21] via-[#7d5233] to-[#442816] rounded-t-[2px] rounded-b-[4px] border-t border-[#D4A853]/20 shadow-[0_0_35px_rgba(255,159,67,0.35)] relative overflow-hidden z-10">
              {/* Subtle wax drip detail */}
              <div className="absolute top-0 left-1.5 w-1 h-4 bg-[#5c3a21] rounded-full opacity-60" />
            </div>
          </div>
        </div>

        {/* Text Details (Parallaxed) */}
        <div ref={textRef} className="max-w-4xl mx-auto flex flex-col items-center gap-6 z-20 transform-gpu transition-transform duration-75">
          <h1 className="font-display text-[72px] md:text-[80px] font-extrabold tracking-tight text-white leading-none">
            The most loving thing <br />
            <span className="italic text-[#D4A853] font-serif font-semibold">you can do for your family</span>
          </h1>

          <p className="font-serif text-lg md:text-xl text-[#F5E6C8]/80 max-w-xl leading-relaxed mt-2 font-medium">
            AfterMind is your autonomous digital estate agent. Set it up once through a gentle conversation. It secures your passwords, documents, and messages, executing your final wishes when the time comes.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center mt-6 w-full max-w-xs sm:max-w-md font-sans">
            <Link 
              to={isAuthenticated ? "/setup" : "/signup"} 
              className="w-full sm:w-auto bg-amber text-warm-white font-bold px-8 py-4 rounded-xl shadow-md hover:scale-105 active:scale-97 cursor-pointer hover:shadow-[0_8px_30px_rgba(193,125,60,0.4)] transition-all duration-300 shimmer-btn flex items-center justify-center gap-2 group"
            >
              <span>Begin Your Preparation</span>
              <ArrowRight size={16} className="group-hover:translate-x-1.5 transition-transform" />
            </Link>
            <Link 
              to="/family-portal" 
              className="w-full sm:w-auto bg-warm-white border border-warm-brown/25 text-deep-brown font-bold px-8 py-4 rounded-xl hover:scale-105 active:scale-97 cursor-pointer hover:shadow-[0_8px_30px_rgba(193,125,60,0.15)] transition-all duration-300 flex items-center justify-center"
            >
              Access Family Portal
            </Link>
          </div>

          <span className="font-serif italic text-xs text-muted-rose/70 mt-6 select-none">
            🕯️ "Some things are too important to leave to chance."
          </span>
        </div>
      </section>

      {/* 2. HOW IT WORKS SECTION — Full Width Dark Background */}
      <section className="w-full bg-[#0D0A07] text-[#FAF7F2] border-b border-warm-brown/10">
        <div className="max-w-6xl mx-auto px-6 py-20 md:py-28 paper-texture">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-[#D4A853] text-center mb-16 tracking-tight">
            How AfterMind Protects Your Legacy
          </h2>

          {/* Staggered Card Grid (Observing scroll for delayed entries) */}
          <div ref={cardsSectionRef} className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Card 1 */}
            <div className={`bg-[#1A1208] border border-[#D4A853]/30 rounded-2xl p-8 flex flex-col gap-5 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-[#D4A853] hover:shadow-[0_10px_30px_rgba(212,168,83,0.2)] hover:bg-[#22180C] ${
              cardsVisible ? 'animate-stagger-1' : 'opacity-0'
            }`}>
              <div className="bg-gradient-to-br from-[#D4A853] to-[#C17D3C] p-3.5 rounded-full text-white w-fit shadow-md flex items-center justify-center">
                <MessageSquare size={22} />
              </div>
              <h3 className="font-display text-[20px] font-bold text-[#D4A853]">1. Have a gentle conversation</h3>
              <p className="font-serif text-[15px] leading-relaxed text-[#F5F0E8]">
                Talk to AfterMind naturally. Our empathetic agent listens, learns, and logs your active subscriptions, documents, and final messages. No overwhelming checklists.
              </p>
            </div>

            {/* Card 2 */}
            <div className={`bg-[#1A1208] border border-[#D4A853]/30 rounded-2xl p-8 flex flex-col gap-5 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-[#D4A853] hover:shadow-[0_10px_30px_rgba(212,168,83,0.2)] hover:bg-[#22180C] ${
              cardsVisible ? 'animate-stagger-2' : 'opacity-0'
            }`}>
              <div className="bg-gradient-to-br from-[#D4A853] to-[#C17D3C] p-3.5 rounded-full text-white w-fit shadow-md flex items-center justify-center">
                <ShieldCheck size={22} />
              </div>
              <h3 className="font-display text-[20px] font-bold text-[#D4A853]">2. Set your wishes</h3>
              <p className="font-serif text-[15px] leading-relaxed text-[#F5F0E8]">
                Assign trusted contacts, compose time-capsule letters for your loved ones, and detail exact instructions for social media accounts and bank portfolios.
              </p>
            </div>

            {/* Card 3 */}
            <div className={`bg-[#1A1208] border border-[#D4A853]/30 rounded-2xl p-8 flex flex-col gap-5 cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:border-[#D4A853] hover:shadow-[0_10px_30px_rgba(212,168,83,0.2)] hover:bg-[#22180C] ${
              cardsVisible ? 'animate-stagger-3' : 'opacity-0'
            }`}>
              <div className="bg-gradient-to-br from-[#D4A853] to-[#C17D3C] p-3.5 rounded-full text-white w-fit shadow-md flex items-center justify-center">
                <Heart size={22} />
              </div>
              <h3 className="font-display text-[20px] font-bold text-[#D4A853]">3. Rest easy</h3>
              <p className="font-serif text-[15px] leading-relaxed text-[#F5F0E8]">
                When the time comes, a trusted executor enters their unique access code. AfterMind autonomously deploys emails, sends messages, and checklists your wishes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CHARTER QUOTE SECTION */}
      <section className="bg-cream/25 border-y border-cream/70 py-20 text-center px-6">
        <div className="max-w-2xl mx-auto space-y-6 flex flex-col items-center">
          
          {/* Decorative Divider Top */}
          <div className="w-16 h-[1px] bg-[#D4A853]/40" />
          
          <p className="font-display text-[28px] italic text-[#D4A853] leading-relaxed font-semibold">
            "Your digital affairs shouldn't be a puzzle left for grieving hands to solve. Organize them thoughtfully today, so they can focus on memory tomorrow."
          </p>
          
          {/* Decorative Divider Bottom */}
          <div className="w-16 h-[1px] bg-[#D4A853]/40" />
          
          <div className="font-sans text-xs uppercase tracking-widest text-[#2C1810] font-bold mt-4">
            The AfterMind Charter
          </div>
        </div>
      </section>
    </div>
  );
}
