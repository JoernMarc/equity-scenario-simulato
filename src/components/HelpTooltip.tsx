


function HelpIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
    </svg>
  );
}

const parseText = (text: string) => {
    return text.split(/(\*.*?\*)/g).map((part, index) => {
        if (part.startsWith('*') && part.endsWith('*')) {
            return <i key={index}>{part.slice(1, -1)}</i>;
        }
        return part;
    });
};


function HelpTooltip({ text, align = 'center' }: { text: string, align?: 'center' | 'right' }) {
    if (!text) return null;
    
    const alignmentClasses = align === 'right' ? 'right-0' : 'left-1/2 -translate-x-1/2';
    const arrowAlignmentClasses = align === 'right' ? 'right-4' : 'left-1/2 -translate-x-1/2';

  return (
    <div className="group relative inline-flex items-center justify-center ml-1.5">
      <button type="button" className="text-subtle hover:text-interactive focus:text-interactive focus:outline-none cursor-help">
        <HelpIcon />
      </button>
      <div className={`absolute top-full mt-2 w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity duration-200 pointer-events-none z-10 transform ${alignmentClasses}`}>
        {parseText(text)}
        <svg className={`absolute text-slate-800 h-2 w-auto bottom-full transform rotate-180 ${arrowAlignmentClasses}`} viewBox="0 0 255 255" xmlSpace="preserve">
            <polygon className="fill-current" points="0,255 127.5,0 255,255"/>
        </svg>
      </div>
    </div>
  );
}

export default HelpTooltip;