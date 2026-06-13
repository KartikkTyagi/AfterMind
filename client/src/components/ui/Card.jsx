import React from 'react';

export default function Card({ 
  children, 
  className = '', 
  hoverable = false,
  ...props 
}) {
  return (
    <div
      className={`
        bg-warm-white 
        border border-cream/90 
        rounded-lg 
        p-6 
        shadow-soft 
        transition-all 
        duration-300 
        ${hoverable ? 'hover:shadow-premium hover:-translate-y-2 cursor-pointer' : ''} 
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
