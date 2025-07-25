
import React, { useState } from 'react';
import type { SampleScenario } from '../types';
import type { Translations } from '../i18n';
import ChevronDownIcon from '../styles/icons/ChevronDownIcon';
import { sampleScenarios } from '../data/sample-scenarios';
import { useLocalization } from '../contexts/LocalizationContext';

interface UserGuideProps {
  onLoadScenario: (scenarioData: SampleScenario['data']) => void;
}

const useCaseIds = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];
const howItWorksSteps = ['1', '2', '3', '4'];
const faqIds = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'];
type ActiveTab = 'howItWorks' | 'useCases' | 'sampleScenarios' | 'faq';

interface AccordionItemProps {
  title: string;
  goal: string;
  features: string;
  isOpen: boolean;
  onToggle: () => void;
  translations: Translations;
}

const AccordionItem: React.FC<AccordionItemProps> = ({ title, goal, features, isOpen, onToggle, translations }) => {
    return (
        <div className="border-b border-subtle">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left py-3 px-2"
                aria-expanded={isOpen}
            >
                <span className="font-semibold text-primary">{title}</span>
                <ChevronDownIcon className={`w-5 h-5 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="px-2 pb-4 text-sm text-secondary">
                    <p><strong className="text-primary">{translations.useCases.goal}:</strong> {goal}</p>
                    <p className="mt-2"><strong className="text-primary">{translations.useCases.features}:</strong> {features}</p>
                </div>
            )}
        </div>
    );
}

function UserGuide({ onLoadScenario }: UserGuideProps) {
  const { t: translations } = useLocalization();
  const [isOpen, setIsOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('sampleScenarios');
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  const tabButtonClasses = (tabName: ActiveTab) => 
    `px-4 py-2 text-sm font-medium rounded-t-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interactive ${
      activeTab === tabName 
        ? 'border-b-2 border-interactive text-primary' 
        : 'text-secondary hover:text-primary'
    }`;
  
  return (
    <div className="bg-surface rounded-lg shadow-md border border-subtle">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="w-full flex justify-between items-center text-left p-4 sm:p-6"
        aria-expanded={isOpen}
      >
        <span className="text-lg font-semibold text-primary">{translations.userGuideTitle}</span>
        <ChevronDownIcon className={`w-5 h-5 text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 sm:px-6 pb-6 border-t border-subtle">
          
          <div className="border-b border-subtle">
            <nav className="-mb-px flex space-x-4" aria-label="Tabs">
                <button onClick={() => setActiveTab('howItWorks')} className={tabButtonClasses('howItWorks')}>
                    {translations.tabHowItWorks}
                </button>
                <button onClick={() => setActiveTab('useCases')} className={tabButtonClasses('useCases')}>
                    {translations.tabUseCases}
                </button>
                <button onClick={() => setActiveTab('sampleScenarios')} className={tabButtonClasses('sampleScenarios')}>
                    {translations.tabSampleScenarios}
                </button>
                <button onClick={() => setActiveTab('faq')} className={tabButtonClasses('faq')}>
                    {translations.tabFaq}
                </button>
            </nav>
          </div>

          <div className="pt-6">
            {activeTab === 'howItWorks' && (
                <section aria-labelledby="how-it-works-title">
                    <h3 id="how-it-works-title" className="text-xl font-bold text-primary mb-2">{translations.howItWorks.title}</h3>
                    <p className="text-secondary mb-6">{translations.howItWorks.intro}</p>
                    <div className="space-y-4">
                        {howItWorksSteps.map(step => {
                            const titleKey = `step${step}Title` as keyof Translations['howItWorks'];
                            const textKey = `step${step}Text` as keyof Translations['howItWorks'];
                            return (
                                <div key={step}>
                                    <h4 className="font-semibold text-primary">{translations.howItWorks[titleKey]}</h4>
                                    <p className="text-sm text-secondary">{translations.howItWorks[textKey]}</p>
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}

            {activeTab === 'useCases' && (
                <section aria-labelledby="use-cases-title">
                    <h3 id="use-cases-title" className="text-xl font-bold text-primary mb-2">{translations.useCases.title}</h3>
                    <div className="border-t border-subtle">
                      {useCaseIds.map(id => {
                          const titleKey = `uc${id}Title` as keyof Translations['useCases'];
                          const goalKey = `uc${id}Goal` as keyof Translations['useCases'];
                          const featuresKey = `uc${id}Features` as keyof Translations['useCases'];
                          
                          return (
                              <AccordionItem
                                  key={id}
                                  title={translations.useCases[titleKey]}
                                  goal={translations.useCases[goalKey]}
                                  features={translations.useCases[featuresKey]}
                                  isOpen={openAccordion === id}
                                  onToggle={() => toggleAccordion(id)}
                                  translations={translations}
                              />
                          )
                      })}
                    </div>
                </section>
            )}
             {activeTab === 'sampleScenarios' && (
                <section aria-labelledby="sample-scenarios-title">
                    <h3 id="sample-scenarios-title" className="text-xl font-bold text-primary mb-4">{translations.sampleScenarios}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {sampleScenarios.map(scenario => (
                            <div key={scenario.id} className="bg-background-subtle p-4 rounded-lg border border-subtle flex flex-col justify-between">
                                <div>
                                    <h4 className="font-bold text-interactive">{translations[scenario.titleKey as keyof Translations] as string}</h4>
                                    <p className="text-sm text-secondary mt-1 mb-3 min-h-[5rem]">{translations[scenario.descriptionKey as keyof Translations] as string}</p>
                                </div>
                                <button
                                    onClick={() => onLoadScenario(scenario.data)}
                                    className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md shadow-sm hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interactive"
                                >
                                    {translations.loadScenario}
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
             )}
             {activeTab === 'faq' && (
                <section aria-labelledby="faq-title">
                    <h3 id="faq-title" className="text-xl font-bold text-primary mb-2">{translations.faq.title}</h3>
                    <div className="border-t border-subtle">
                        {faqIds.map(id => {
                            const titleKey = `q${id}Title` as keyof Translations['faq'];
                            const answerKey = `q${id}Answer` as keyof Translations['faq'];
                            
                            return (
                                <div key={`faq-${id}`} className="border-b border-subtle">
                                    <button
                                        onClick={() => toggleAccordion(`faq-${id}`)}
                                        className="w-full flex justify-between items-center text-left py-3 px-2"
                                        aria-expanded={openAccordion === `faq-${id}`}
                                    >
                                        <span className="font-semibold text-primary">{translations.faq[titleKey]}</span>
                                        <ChevronDownIcon className={`w-5 h-5 text-secondary transition-transform ${openAccordion === `faq-${id}` ? 'rotate-180' : ''}`} />
                                    </button>
                                    {openAccordion === `faq-${id}` && (
                                        <div className="px-2 pb-4 text-sm text-secondary prose prose-sm max-w-none">
                                            <p dangerouslySetInnerHTML={{ __html: translations.faq[answerKey] }} />
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                </section>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default UserGuide;
