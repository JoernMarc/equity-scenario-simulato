
import React from 'react';

function TextSizeIcon({ className = 'w-6 h-6' }: { className?: string }) {
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
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" 
      />
    </svg>
  )
}
export default TextSizeIcon;
