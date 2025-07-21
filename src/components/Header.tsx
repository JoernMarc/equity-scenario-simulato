

import type { FontSize, Theme } from '../types';
import ContrastIcon from '../styles/icons/ContrastIcon';
import TextSizeIcon from '../styles/icons/TextSizeIcon';
import SparklesIcon from '../styles/icons/SparklesIcon';
import SunIcon from '../styles/icons/SunIcon';
import { useLocalization } from '../contexts/LocalizationContext';

interface HeaderProps {
  onOpenImportExportModal: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

function Header({ onOpenImportExportModal, theme, setTheme, onIncreaseFontSize, onDecreaseFontSize }: HeaderProps) {
  const { language, setLanguage, t: translations } = useLocalization();

  const langButtonClasses = (lang: typeof language) => 
    `px-3 py-1 text-sm rounded-md transition-colors ${
      language === lang 
        ? 'bg-interactive text-on-interactive' 
        : 'bg-surface text-secondary hover:bg-background-subtle'
    }`;

  const accessibilityButtonClasses = "p-2 rounded-md transition-colors text-secondary hover:bg-background-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive";
  
  const themeButtonClasses = (buttonTheme: Theme) => 
    `${accessibilityButtonClasses} ${theme === buttonTheme ? 'bg-interactive text-on-interactive' : ''}`;

  return (
    <header className="bg-surface shadow-md p-4 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-primary">{translations.appTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 bg-background-subtle rounded-lg border border-subtle" title={translations.accessibilityControls}>
                <button onClick={() => setTheme('classic')} className={themeButtonClasses('classic')} aria-label={translations.themeClassicTooltip} title={translations.themeClassicTooltip}>
                    <SparklesIcon className="w-5 h-5"/>
                </button>
                 <button onClick={() => setTheme('modern')} className={themeButtonClasses('modern')} aria-label={translations.themeModernTooltip} title={translations.themeModernTooltip}>
                    <SunIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => setTheme('contrast')} className={themeButtonClasses('contrast')} aria-label={translations.themeContrastTooltip} title={translations.themeContrastTooltip}>
                    <ContrastIcon className="w-5 h-5"/>
                </button>

                <div className="w-px h-6 bg-border-subtle mx-1"></div>
                
                <button onClick={onDecreaseFontSize} className={accessibilityButtonClasses} aria-label={translations.decreaseFontSizeTooltip} title={translations.decreaseFontSizeTooltip}>
                    <TextSizeIcon className="w-4 h-4"/>
                </button>
                 <button onClick={onIncreaseFontSize} className={accessibilityButtonClasses} aria-label={translations.increaseFontSizeTooltip} title={translations.increaseFontSizeTooltip}>
                    <TextSizeIcon className="w-6 h-6"/>
                </button>
            </div>

            <button
                onClick={onOpenImportExportModal}
                className="px-3 py-2 text-sm font-medium text-secondary bg-background-subtle rounded-lg border border-subtle hover:bg-background transition-colors"
                >
                {translations.importExport}
            </button>
            <div className="flex items-center gap-1 p-1 bg-background-subtle rounded-lg border border-subtle">
              <button onClick={() => setLanguage('de')} className={langButtonClasses('de')}>DE</button>
              <button onClick={() => setLanguage('en')} className={langButtonClasses('en')}>EN</button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;