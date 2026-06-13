import React from 'react';

export default function Button({ 
  children, 
  variant = 'primary', 
  onClick, 
  type = 'button', 
  disabled = false, 
  className = '',
  loading = false,
  ...props 
}) {
  const baseStyles = 'px-5 py-2.5 rounded-md font-sans font-semibold text-sm transition-all duration-300 focus:outline-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer hover:scale-105 active:scale-97 active:duration-75';
  
  const variants = {
    primary: 'bg-amber text-warm-white hover:bg-warm-brown shadow-sm hover:shadow-[0_8px_30px_rgba(193,125,60,0.4)] shimmer-btn',
    secondary: 'bg-warm-white border border-warm-brown/20 text-deep-brown hover:bg-cream/50 active:bg-cream hover:shadow-[0_8px_30px_rgba(193,125,60,0.15)]',
    outline: 'border border-amber text-amber hover:bg-amber/5 active:bg-amber/10 hover:shadow-[0_8px_30px_rgba(193,125,60,0.2)]',
    danger: 'bg-red-800 text-warm-white hover:bg-red-950 shadow-sm hover:shadow-[0_8px_30px_rgba(193,125,60,0.3)] shimmer-btn',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}
