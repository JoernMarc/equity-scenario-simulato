


import { useState, useRef, useEffect } from 'react';
import PrintIcon from '../styles/icons/PrintIcon';
import DownloadIcon from '../styles/icons/DownloadIcon';
import { useLocalization } from '../contexts/LocalizationContext';

interface ResultCardActionsProps {
  onPrint: () => void;
  onExport: (format: 'png' | 'pdf') => void;
}

function ResultCardActions({ onPrint, onExport }: ResultCardActionsProps) {
  const { t: translations } = useLocalization();
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const buttonClasses = "p-2 rounded-md transition-colors text-secondary hover:bg-background-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(event.target as Node)) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleExport = (format: 'png' | 'pdf') => {
    onExport(format);
    setIsExportMenuOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={onPrint} className={buttonClasses} title={translations.print}>
        <PrintIcon className="w-5 h-5" />
      </button>

      <div className="relative" ref={exportMenuRef}>
        <button onClick={() => setIsExportMenuOpen(!isExportMenuOpen)} className={buttonClasses} title={translations.export}>
          <DownloadIcon className="w-5 h-5" />
        </button>

        {isExportMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-surface rounded-md shadow-lg z-10 border border-subtle">
            <div className="py-1">
              <button
                onClick={() => handleExport('png')}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-background-subtle"
              >
                <span>{translations.exportAsPng}</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-primary hover:bg-background-subtle"
              >
                <span>{translations.exportAsPdf}</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ResultCardActions;