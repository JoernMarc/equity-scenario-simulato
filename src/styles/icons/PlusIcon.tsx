
import React from 'react';

function PlusIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5}
        d="M12 4.5v15m7.5-7.5h-15"
      />
    </svg>
  );
}

export default PlusIcon;
