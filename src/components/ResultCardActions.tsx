
import React, { useState, useRef, useEffect } from 'react';
import type { Translations } from '../i18n';
import PrintIcon from '../styles/icons/PrintIcon';
import DownloadIcon from '../styles/icons/DownloadIcon';

interface ResultCardActionsProps {
  onPrint: () => void;
  onExport: (format: 'png' | 'pdf') => void;
  translations: Translations;
}

function ResultCardActions({ onPrint, onExport, translations }: ResultCardActionsProps) {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);

  const buttonClasses = "p-2 rounded-md transition-colors text-theme-secondary hover:bg-theme-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 ring-theme-interactive";

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
          <div className="absolute right-0 mt-2 w-48 bg-theme-surface rounded-md shadow-lg z-10 border border-theme-subtle">
            <div className="py-1">
              <button
                onClick={() => handleExport('png')}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-theme-primary hover:bg-theme-subtle"
              >
                <span>{translations.exportAsPng}</span>
              </button>
              <button
                onClick={() => handleExport('pdf')}
                className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-theme-primary hover:bg-theme-subtle"
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
