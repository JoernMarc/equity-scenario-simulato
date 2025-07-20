
import React from 'react';

function TextSizeIcon({ className = 'w-6 h-6 stroke-2' }: { className?: string }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      className={className} 
      // Dies ist ein "Outline"-Icon
      fill="none" 
      viewBox="0 0 24 24" 
      stroke="currentColor"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth={1.5} // Oder steuern Sie dies über eine Klasse wie 'stroke-[1.5px]'
        d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" 
      />
    </svg>
  )
}
export default TextSizeIcon;

