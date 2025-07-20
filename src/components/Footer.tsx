import React from 'react';
import type { Translations } from '../i18n';
import type { LegalTab } from '../types';

interface FooterProps {
  onOpenLegalModal: (initialTab?: LegalTab) => void;
  translations: Translations;
}

function Footer({ onOpenLegalModal, translations }: FooterProps) {
  return (
    <footer className="w-full bg-theme-background border-t border-theme-subtle mt-8">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-theme-secondary">
        <button
          onClick={() => onOpenLegalModal('disclaimer')}
          className="hover:text-theme-primary hover:underline"
          title={translations.legal.tabDisclaimer}
        >
          © 2025 Jörn Densing, Wachtberg (Deutschland)
        </button>
        <button 
          onClick={() => onOpenLegalModal('impressum')}
          className="hover:text-theme-primary hover:underline"
          title={translations.footer.legalNotice}
        >
          {translations.footer.legalNotice}
        </button>
      </div>
    </footer>
  );
}

export default Footer;