
import type { LegalTab } from '../types';
import { useLocalization } from '../contexts/LocalizationContext';

interface FooterProps {
  onOpenLegalModal: (initialTab?: LegalTab) => void;
}

function Footer({ onOpenLegalModal }: FooterProps) {
  const { t: translations } = useLocalization();
  return (
    <footer className="w-full bg-background border-t border-subtle mt-8">
      <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-sm text-secondary">
        <button
          onClick={() => onOpenLegalModal('disclaimer')}
          className="hover:text-primary hover:underline"
          title={translations.legal.tabDisclaimer}
        >
          © 2025 Jörn Densing, Wachtberg (Deutschland)
        </button>
        <button 
          onClick={() => onOpenLegalModal('impressum')}
          className="hover:text-primary hover:underline"
          title={translations.footer.legalNotice}
        >
          {translations.footer.legalNotice}
        </button>
      </div>
    </footer>
  );
}

export default Footer;