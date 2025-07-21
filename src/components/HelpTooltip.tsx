import React from 'react';

function HelpIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

function HelpTooltip({ text }: { text: string }) {
    if (!text) return null;
    
  return (
    <div className="group relative inline-flex items-center justify-center ml-1.5">
      <button type="button" className="text-subtle hover:text-interactive focus:text-interactive focus:outline-none cursor-help">
        <HelpIcon />
      </button>
      <div className="absolute top-full mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-10 transform -translate-x-1/2 left-1/2">
        {text}
        <svg className="absolute text-slate-800 h-2 w-full left-0 bottom-full transform rotate-180" x="0px" y="0px" viewBox="0 0 255 255" xmlSpace="preserve">
            <polygon className="fill-current" points="0,0 127.5,127.5 255,0"/>
        </svg>
      </div>
    </div>
  );
}

export default HelpTooltip;