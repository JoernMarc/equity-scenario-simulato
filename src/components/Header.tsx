
import React from 'react';
import type { Language, FontSize, Theme } from '../types';
import type { Translations } from '../i18n';
import ContrastIcon from '../styles/icons/ContrastIcon';
import TextSizeIcon from '../styles/icons/TextSizeIcon';
import SparklesIcon from '../styles/icons/SparklesIcon';
import SunIcon from '../styles/icons/SunIcon';

interface HeaderProps {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: Translations;
  onOpenImportExportModal: () => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  fontSize: FontSize;
  onIncreaseFontSize: () => void;
  onDecreaseFontSize: () => void;
}

function Header({ language, setLanguage, translations, onOpenImportExportModal, theme, setTheme, onIncreaseFontSize, onDecreaseFontSize }: HeaderProps) {
  const langButtonClasses = (lang: Language) => 
    `px-3 py-1 text-sm rounded-md transition-colors ${
      language === lang 
        ? 'bg-theme-interactive text-theme-on-interactive' 
        : 'bg-theme-surface text-theme-secondary hover:bg-theme-subtle'
    }`;

  const accessibilityButtonClasses = "p-2 rounded-md transition-colors text-theme-secondary hover:bg-theme-subtle focus:outline-none focus:ring-2 focus:ring-offset-2 ring-theme-interactive";
  
  const themeButtonClasses = (buttonTheme: Theme) => 
    `${accessibilityButtonClasses} ${theme === buttonTheme ? 'bg-theme-interactive text-theme-on-interactive' : ''}`;

  return (
    <header className="bg-theme-surface shadow-md p-4 mb-8">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-theme-primary">{translations.appTitle}</h1>
        </div>
        <div className="flex items-center gap-4">
            <div className="flex items-center gap-1 p-1 bg-theme-subtle rounded-lg border border-theme-subtle" title={translations.accessibilityControls}>
                <button onClick={() => setTheme('classic')} className={themeButtonClasses('classic')} aria-label={translations.themeClassicTooltip} title={translations.themeClassicTooltip}>
                    <SparklesIcon className="w-5 h-5"/>
                </button>
                 <button onClick={() => setTheme('modern')} className={themeButtonClasses('modern')} aria-label={translations.themeModernTooltip} title={translations.themeModernTooltip}>
                    <SunIcon className="w-5 h-5"/>
                </button>
                <button onClick={() => setTheme('contrast')} className={themeButtonClasses('contrast')} aria-label={translations.themeContrastTooltip} title={translations.themeContrastTooltip}>
                    <ContrastIcon className="w-5 h-5"/>
                </button>

                <div className="w-px h-6 bg-theme-border-subtle mx-1"></div>
                
                <button onClick={onDecreaseFontSize} className={accessibilityButtonClasses} aria-label={translations.decreaseFontSizeTooltip} title={translations.decreaseFontSizeTooltip}>
                    <TextSizeIcon className="w-4 h-4"/>
                </button>
                 <button onClick={onIncreaseFontSize} className={accessibilityButtonClasses} aria-label={translations.increaseFontSizeTooltip} title={translations.increaseFontSizeTooltip}>
                    <TextSizeIcon className="w-6 h-6"/>
                </button>
            </div>

            <button
                onClick={onOpenImportExportModal}
                className="px-3 py-2 text-sm font-medium text-theme-secondary bg-theme-subtle rounded-lg border border-theme-subtle hover:bg-theme-background transition-colors"
                >
                {translations.importExport}
            </button>
            <div className="flex items-center gap-1 p-1 bg-theme-subtle rounded-lg border border-theme-subtle">
              <button onClick={() => setLanguage('de')} className={langButtonClasses('de')}>DE</button>
              <button onClick={() => setLanguage('en')} className={langButtonClasses('en')}>EN</button>
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
