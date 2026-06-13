import React from 'react';

export default function ProgressBar({ 
  percentage, 
  height = 'h-2', 
  className = '' 
}) {
  const roundedPercent = Math.min(100, Math.max(0, Math.round(percentage)));

  return (
    <div className={`w-full bg-cream/60 rounded-full overflow-hidden ${className}`}>
      <div 
        className={`bg-amber ${height} transition-all duration-700 ease-out rounded-full`}
        style={{ width: `${roundedPercent}%` }}
      />
    </div>
  );
}
