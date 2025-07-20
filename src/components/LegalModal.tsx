
import React, { useState, useEffect, useRef } from 'react';
import type { Translations } from '../i18n';
import type { LegalTab } from '../types';
import CloseIcon from '../styles/icons/CloseIcon';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  translations: Translations;
  initialTab?: LegalTab;
}

// Helper function to parse markdown-style bold text and newlines
const parseContent = (text: string): React.ReactNode[] => {
    return text.split('\n').map((line, lineIndex) => {
        // Don't wrap empty lines in <p> tags to avoid extra space
        if (line.trim() === '') {
            // Render a non-breaking space to ensure the line takes up space
            return <p key={lineIndex}>&nbsp;</p>;
        }
        const parts = line.split(/(\*\*.*?\*\*)/g);
        return (
            <p key={lineIndex}>
                {parts.map((part, partIndex) => {
                    if (part.startsWith('**') && part.endsWith('**')) {
                        return <strong key={partIndex}>{part.slice(2, -2)}</strong>;
                    }
                    return part;
                })}
            </p>
        );
    });
};


function LegalModal({ isOpen, onClose, translations, initialTab = 'impressum' }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState<LegalTab>(initialTab);
  const modalRef = useRef<HTMLDivElement>(null);
  const firstTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus the first tab button when modal opens for accessibility
      firstTabRef.current?.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
        if (e.key === 'Tab') {
          const focusableElements = modalRef.current?.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          if (!focusableElements) return;

          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];

          if (e.shiftKey) { // Shift+Tab
            if (document.activeElement === firstElement) {
              lastElement.focus();
              e.preventDefault();
            }
          } else { // Tab
            if (document.activeElement === lastElement) {
              firstElement.focus();
              e.preventDefault();
            }
          }
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const renderContent = () => {
    switch (activeTab) {
      case 'impressum':
        return { title: translations.legal.impressumTitle, content: translations.legal.impressumText };
      case 'privacy':
        return { title: translations.legal.privacyTitle, content: translations.legal.privacyText };
      case 'disclaimer':
        return { title: translations.legal.disclaimerTitle, content: translations.legal.disclaimerText };
      default:
        return { title: '', content: '' };
    }
  };
  
  const tabButtonClasses = (tabName: LegalTab) => 
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-interactive ${
      activeTab === tabName 
        ? 'bg-theme-surface text-theme-primary border-b-2 border-theme-interactive' 
        : 'text-theme-secondary hover:bg-theme-subtle hover:text-theme-primary'
    }`;
    
  const { title, content } = renderContent();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-modal-title"
    >
      <div 
        ref={modalRef}
        className="relative bg-theme-surface rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-theme-subtle">
            <h3 id="legal-modal-title" className="text-xl font-semibold text-theme-primary">{translations.legal.title}</h3>
            <button 
                onClick={onClose} 
                className="text-theme-secondary hover:text-theme-primary"
                aria-label="Close"
            >
                <CloseIcon />
            </button>
        </div>
        
        <div className="border-b border-theme-subtle px-4">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button ref={firstTabRef} onClick={() => setActiveTab('impressum')} className={tabButtonClasses('impressum')}>
                    {translations.legal.tabImpressum}
                </button>
                <button onClick={() => setActiveTab('privacy')} className={tabButtonClasses('privacy')}>
                    {translations.legal.tabPrivacy}
                </button>
                <button onClick={() => setActiveTab('disclaimer')} className={tabButtonClasses('disclaimer')}>
                    {translations.legal.tabDisclaimer}
                </button>
            </nav>
        </div>

        <div className="p-6 overflow-y-auto">
          <h4 className="text-lg font-bold text-theme-primary mb-4">{title}</h4>
          <div className="prose prose-sm text-theme-secondary max-w-none">
            {parseContent(content)}
          </div>
        </div>
      </div>
    </div>
  );
}

export default LegalModal;
