

import React, { useState, useMemo } from 'react';
import type { FoundingTransaction, ShareClass, Shareholding, VestingSchedule } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import { LEGAL_FORMS, LEGAL_FORM_REQUIREMENTS, COMMON_CURRENCIES } from '../../constants';
import HelpTooltip from '../HelpTooltip';
import CurrencyInput from '../common/CurrencyInput';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useProject } from '../../contexts/ProjectContext';

interface CompanyFormProps {
  onSubmit: (transaction: FoundingTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: FoundingTransaction;
}

const createDefaultShareClass = (): ShareClass => ({
    id: crypto.randomUUID(),
    name: 'Common Stock',
    liquidationPreferenceRank: 0,
    liquidationPreferenceFactor: 1,
    liquidationPreferenceType: 'NON_PARTICIPATING',
    antiDilutionProtection: 'NONE',
    votesPerShare: 1,
    protectiveProvisions: [],
});

const createDefaultVestingSchedule = (): VestingSchedule => ({
    id: crypto.randomUUID(),
    name: '4-Year Vest, 1-Year Cliff',
    grantDate: new Date().toISOString().split('T')[0],
    vestingPeriodMonths: 48,
    cliffMonths: 12,
});


function CompanyForm({ onSubmit, onCancel, transactionToEdit }: CompanyFormProps) {
  const { t: translations, locale } = useLocalization();
  const { stakeholders } = useProject();
  const isEditing = !!transactionToEdit;
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [companyName, setCompanyName] = useState(transactionToEdit?.companyName || '');
  const [legalForm, setLegalForm] = useState(transactionToEdit?.legalForm || LEGAL_FORMS[0].value);
  const [currency, setCurrency] = useState(transactionToEdit?.currency || 'EUR');
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');
  
  const [shareClasses, setShareClasses] = useState<ShareClass[]>(transactionToEdit?.shareClasses || [createDefaultShareClass()]);
  const [vestingSchedules, setVestingSchedules] = useState<VestingSchedule[]>(transactionToEdit?.vestingSchedules || []);
  const [shareholdings, setShareholdings] = useState<Shareholding[]>(
    transactionToEdit?.shareholdings || [{ id: crypto.randomUUID(), stakeholderId: '', stakeholderName: '', shareClassId: shareClasses[0].id, shares: 0, investment: 0 }]
  );

  const currencyFormatter = useMemo(() => new Intl.NumberFormat(locale, { style: 'currency', currency }), [locale, currency]);


  const handleShareholdingChange = <K extends keyof Shareholding>(index: number, field: K, value: Shareholding[K]) => {
    setShareholdings(prev => prev.map((sh, i) => i === index ? { ...sh, [field]: value } : sh));
  };
  
  const addShareholding = () => {
    if(shareClasses.length === 0) return;
    setShareholdings([...shareholdings, { id: crypto.randomUUID(), stakeholderId: '', stakeholderName: '', shareClassId: shareClasses[0].id, shares: 0, investment: 0 }]);
  };

  const removeShareholding = (index: number) => {
    setShareholdings(shareholdings.filter((_, i) => i !== index));
  };
  
  const addVestingSchedule = () => setVestingSchedules([...vestingSchedules, createDefaultVestingSchedule()]);
  const removeVestingSchedule = (id: string) => setVestingSchedules(vestingSchedules.filter(vs => vs.id !== id));
  const handleVestingScheduleChange = <K extends keyof VestingSchedule>(index: number, field: K, value: VestingSchedule[K]) => {
      setVestingSchedules(prev => prev.map((vs, i) => i === index ? { ...vs, [field]: value } : vs));
  }

  const handleShareClassChange = <K extends keyof ShareClass>(index: number, field: K, value: ShareClass[K]) => {
    setShareClasses(prev => prev.map((sc, i) => i === index ? { ...sc, [field]: value } : sc));
  };


  const totalInvestment = useMemo(() => 
    shareholdings.reduce((sum, sh) => sum + (sh.investment || 0), 0),
    [shareholdings]
  );
  
  const legalRequirement = useMemo(() => LEGAL_FORM_REQUIREMENTS[legalForm], [legalForm]);

  const isCapitalSufficient = useMemo(() => {
      if (!legalRequirement || legalRequirement.requiredCapital === undefined) return true;
      if (legalRequirement.currency.toUpperCase() !== currency.toUpperCase()) return true; // Don't check if currencies don't match
      return totalInvestment >= legalRequirement.requiredCapital;
  }, [totalInvestment, legalRequirement, currency]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const finalShareholdings = shareholdings
      .filter(s => s.stakeholderName && (s.shares > 0 || (s.investment ?? 0) > 0))
      .map(sh => {
          const pricePerShare = (sh.investment ?? 0) > 0 && sh.shares > 0 ? (sh.investment ?? 0) / sh.shares : 0;
          return {
              ...sh,
              originalPricePerShare: pricePerShare
          }
      });

    const transaction: FoundingTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.FOUNDING,
      date,
      companyName,
      legalForm,
      currency: currency.toUpperCase(),
      status,
      validFrom,
      validTo: validTo || undefined,
      shareClasses,
      shareholdings: finalShareholdings,
      vestingSchedules: vestingSchedules.length > 0 ? vestingSchedules : undefined,
    };
    onSubmit(transaction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <datalist id="stakeholders-list">
        {stakeholders.map(s => <option key={s.id} value={s.name} />)}
      </datalist>
      <datalist id="currencies-list">
        {COMMON_CURRENCIES.map(c => <option key={c} value={c} />)}
      </datalist>

      <h3 className="text-xl font-semibold text-primary">{isEditing ? translations.editFounding : translations.createFounding}</h3>
      
      <fieldset className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-secondary">{translations.companyName}</label>
            <input type="text" id="companyName" value={companyName} onChange={e => setCompanyName(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive"/>
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-secondary">{translations.date}</label>
            <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive"/>
          </div>
          <div>
            <label htmlFor="legalForm" className="block text-sm font-medium text-secondary">{translations.legalForm}</label>
            <select id="legalForm" value={legalForm} onChange={e => setLegalForm(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive">
              {LEGAL_FORMS.map(form => <option key={form.value} value={form.value}>{form.label} ({form.country})</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="currency" className="flex items-center text-sm font-medium text-secondary">{translations.currency} <HelpTooltip text={translations.help.currency} /></label>
            <input 
              type="text" 
              id="currency" 
              value={currency} 
              onChange={e => setCurrency(e.target.value)} 
              required 
              maxLength={3}
              pattern="[A-Za-z]{3}"
              placeholder={translations.currencyPlaceholder}
              className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive uppercase"
              list="currencies-list"
              disabled={isEditing}
            />
          </div>
        </div>
      </fieldset>

      <fieldset className="pt-4 mt-4 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2">{translations.statusAndValidity}</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary">{translations.status}</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive">
                <option value={TransactionStatus.DRAFT}>{translations.draft}</option>
                <option value={TransactionStatus.ACTIVE}>{translations.active}</option>
                <option value={TransactionStatus.ARCHIVED}>{translations.archived}</option>
              </select>
            </div>
            <div>
              <label htmlFor="validFrom" className="block text-sm font-medium text-secondary">{translations.validFrom}</label>
              <input type="date" id="validFrom" value={validFrom} onChange={e => setValidFrom(e.target.value)} required className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive"/>
            </div>
            <div>
              <label htmlFor="validTo" className="block text-sm font-medium text-secondary">{translations.validTo} <span className="text-subtle">({translations.optional})</span></label>
              <input type="date" id="validTo" value={validTo} onChange={e => setValidTo(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive"/>
            </div>
        </div>
      </fieldset>
      
       <fieldset className="pt-4 mt-4 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{translations.initialShareClasses} <HelpTooltip text={translations.help.initialShareClasses} /></legend>
        <div className="space-y-3">
          {shareClasses.map((sc, index) => (
             <div key={sc.id} className="p-3 bg-background-subtle rounded-md border border-subtle space-y-3">
                <label className="text-sm font-medium text-secondary">{translations.shareClassName}</label>
                <input 
                    type="text" 
                    value={sc.name} 
                    onChange={e => handleShareClassChange(index, 'name', e.target.value)}
                    placeholder={translations.shareClassName}
                    className="w-full px-2 py-1 bg-surface border border-strong rounded-md"/>
                
                 <div>
                    <label className="text-sm font-medium text-secondary">{translations.votesPerShare}</label>
                    <input type="number" min="0" value={sc.votesPerShare}
                        onChange={e => handleShareClassChange(index, 'votesPerShare', parseInt(e.target.value, 10) || 0)}
                        className="w-full px-2 py-1 bg-surface border border-strong rounded-md"
                    />
                </div>
             </div>
          ))}
        </div>
      </fieldset>
      
      <fieldset className="pt-4 mt-4 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{translations.vestingSchedules} <HelpTooltip text={translations.help.vestingSchedules} /></legend>
         <div className="space-y-3">
            {vestingSchedules.map((vs, index) => (
                <div key={vs.id} className="p-3 bg-background-subtle rounded-md border border-subtle space-y-2 relative">
                    <button type="button" onClick={() => removeVestingSchedule(vs.id)} className="absolute top-2 right-2 p-1 text-danger hover:text-danger-hover hover:bg-danger-subtle-bg rounded-md h-8 w-8 flex-shrink-0 flex items-center justify-center">
                        &times;
                    </button>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-secondary">{translations.scheduleName}</label>
                            <input type="text" value={vs.name} onChange={e => handleVestingScheduleChange(index, 'name', e.target.value)} className="w-full px-2 py-1 bg-surface border border-strong rounded-md"/>
                        </div>
                         <div>
                            <label className="text-xs text-secondary">{translations.grantDate}</label>
                            <input type="date" value={vs.grantDate} onChange={e => handleVestingScheduleChange(index, 'grantDate', e.target.value)} className="w-full px-2 py-1 bg-surface border border-strong rounded-md"/>
                        </div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-secondary">{translations.vestingPeriodMonths}</label>
                            <input type="number" min="0" value={vs.vestingPeriodMonths} onChange={e => handleVestingScheduleChange(index, 'vestingPeriodMonths', parseInt(e.target.value,10) || 0)} className="w-full px-2 py-1 bg-surface border border-strong rounded-md"/>
                        </div>
                        <div>
                           <label className="text-xs flex items-center text-secondary">{translations.cliffMonths} <HelpTooltip text={translations.help.vestingCliff} /></label>
                            <input type="number" min="0" value={vs.cliffMonths} onChange={e => handleVestingScheduleChange(index, 'cliffMonths', parseInt(e.target.value,10) || 0)} className="w-full px-2 py-1 bg-surface border border-strong rounded-md"/>
                        </div>
                    </div>
                </div>
            ))}
         </div>
         <button type="button" onClick={addVestingSchedule} className="mt-3 text-sm flex items-center gap-1 text-interactive hover:text-interactive-hover">
            {translations.addVestingSchedule}
        </button>
      </fieldset>


      <fieldset className="pt-4 mt-4 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{translations.shareholdings} <HelpTooltip text={translations.help.shareholdings} /></legend>
        <div className="space-y-3">
          {shareholdings.map((sh, index) => {
            const pricePerShare = (sh.investment ?? 0) > 0 && sh.shares > 0 
              ? (sh.investment ?? 0) / sh.shares 
              : 0;

            return (
              <div key={sh.id} className="p-3 bg-background-subtle rounded-md border border-subtle space-y-2">
                <div className="flex justify-between items-start">
                    <div className="flex-grow pr-4">
                        <label className="text-xs text-secondary">{translations.stakeholderName}</label>
                        <input type="text" value={sh.stakeholderName} onChange={e => handleShareholdingChange(index, 'stakeholderName', e.target.value)} placeholder={translations.stakeholderName} className="w-full px-2 py-1 bg-surface border border-strong rounded-md" list="stakeholders-list"/>
                    </div>
                    <button type="button" onClick={() => removeShareholding(index)} className="p-1 text-danger hover:text-danger-hover hover:bg-danger-subtle-bg rounded-md h-8 w-8 flex-shrink-0 flex items-center justify-center mt-3">
                        &times;
                    </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-secondary">{translations.numberOfShares}</label>
                        <input type="number" min="0" value={sh.shares} onChange={e => handleShareholdingChange(index, 'shares', parseInt(e.target.value, 10) || 0)} className="w-full px-2 py-1 bg-surface border border-strong rounded-md text-right"/>
                    </div>
                     <div>
                        <label className="text-xs text-secondary">{translations.investmentAmount} <span className="text-subtle">({translations.optional})</span></label>
                        <CurrencyInput 
                            value={sh.investment || ''} 
                            onChange={value => handleShareholdingChange(index, 'investment', value === '' ? 0 : value)} 
                            currency={currency} 
                            className="w-full px-2 py-1 bg-surface border border-strong rounded-md text-right"
                            id={`investment-${index}`}
                        />
                    </div>
                </div>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="text-xs text-secondary">{translations.shareClass}</label>
                        <select value={sh.shareClassId} onChange={e => handleShareholdingChange(index, 'shareClassId', e.target.value)} className="w-full px-2 py-1 bg-surface border border-strong rounded-md">
                            {shareClasses.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs text-secondary">{translations.assignVestingSchedule}</label>
                        <select 
                            value={sh.vestingScheduleId || ''} 
                            onChange={e => handleShareholdingChange(index, 'vestingScheduleId', e.target.value)} 
                            className="w-full px-2 py-1 bg-surface border border-strong rounded-md"
                            disabled={vestingSchedules.length === 0}
                        >
                            <option value="">{translations.noVesting}</option>
                            {vestingSchedules.map(vs => <option key={vs.id} value={vs.id}>{vs.name}</option>)}
                        </select>
                    </div>
                </div>
                {pricePerShare > 0 && (
                  <div className="text-xs text-secondary bg-background p-2 rounded text-center">
                    {translations.pricePerShare}: {currencyFormatter.format(pricePerShare)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
        <button type="button" onClick={addShareholding} className="mt-3 text-sm flex items-center gap-1 text-interactive hover:text-interactive-hover">
          {translations.addShareholding}
        </button>
        {legalRequirement?.requiredCapital !== undefined && (
          <div className={`mt-4 p-3 rounded-md text-sm ${!isCapitalSufficient ? 'bg-warning-subtle-bg text-warning-subtle-text' : 'bg-background-subtle border-subtle'} border`}>
            <div className="flex justify-between font-mono">
              <span className="font-semibold">{translations.totalInvestment}:</span>
              <span className={`text-right ${!isCapitalSufficient ? 'text-warning-subtle-text' : 'text-primary'}`}>{currencyFormatter.format(totalInvestment)}</span>
            </div>
            <div className="flex justify-between mt-1 font-mono">
              <span className="font-semibold">{translations.requiredShareCapital}:</span>
              <span className={`text-right ${!isCapitalSufficient ? 'text-warning-subtle-text' : 'text-primary'}`}>{currencyFormatter.format(legalRequirement.requiredCapital)}</span>
            </div>
            {!isCapitalSufficient && (
              <p className="font-semibold mt-2 text-center">
                {translations.shareCapitalRequirementWarning.replace('{amount}', currencyFormatter.format(legalRequirement.requiredCapital))}
              </p>
            )}
          </div>
        )}
      </fieldset>

      <div className="flex justify-end gap-4 pt-4 border-t border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background">{translations.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover">{isEditing ? translations.update : translations.save}</button>
      </div>
    </form>
  );
};

export default CompanyForm;
