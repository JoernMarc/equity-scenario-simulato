

import React, { useState, useMemo } from 'react';
import type { FinancingRoundTransaction, Shareholding, ShareClass, ConvertibleLoanTransaction, LiquidationPreferenceType, AntiDilutionProtection } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import { ANTI_DILUTION_TYPES, LIQUIDATION_PREFERENCE_TYPES } from '../../constants';
import HelpTooltip from '../HelpTooltip';
import { snakeToCamel } from '../../logic/utils';
import CurrencyInput from '../common/CurrencyInput';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useProject } from '../../contexts/ProjectContext';
import type { Translations } from '../../i18n';

interface NewInvestorInput {
    id: string;
    stakeholderId: string;
    name: string;
    investment: number;
}
interface FinancingRoundFormProps {
  onSubmit: (transaction: FinancingRoundTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: FinancingRoundTransaction;
  preRoundTotalShares: number;
  convertibleLoans: ConvertibleLoanTransaction[];
}

const createDefaultShareClass = (): ShareClass => ({
    id: crypto.randomUUID(),
    name: 'Series A Preferred',
    liquidationPreferenceRank: 1,
    liquidationPreferenceFactor: 1,
    liquidationPreferenceType: 'NON_PARTICIPATING',
    antiDilutionProtection: 'BROAD_BASED',
    votesPerShare: 1,
    protectiveProvisions: [],
});

const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive";


function FinancingRoundForm({ onSubmit, onCancel, transactionToEdit, preRoundTotalShares, convertibleLoans }: FinancingRoundFormProps) {
  const { t: translations, locale } = useLocalization();
  const { stakeholders, projectCurrency } = useProject();
  const isEditing = !!transactionToEdit;
  
  // Basic Info
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [roundName, setRoundName] = useState(transactionToEdit?.roundName || '');
  const [preMoneyValuation, setPreMoneyValuation] = useState<number | ''>(transactionToEdit?.preMoneyValuation || '');
  
  // Status
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');

  // New Share Class
  const [newShareClass, setNewShareClass] = useState<ShareClass>(transactionToEdit?.newShareClass || createDefaultShareClass());
  
  // New Investors
  const [newInvestorInputs, setNewInvestorInputs] = useState<NewInvestorInput[]>(
    transactionToEdit?.newShareholdings.map(sh => ({ id: sh.id, stakeholderId: sh.stakeholderId, name: sh.stakeholderName, investment: sh.investment || 0 })) || [{ id: crypto.randomUUID(), stakeholderId: '', name: '', investment: 0 }]
  );
  
  // Loan Conversions
  const [convertsLoanIds, setConvertsLoanIds] = useState<string[]>(transactionToEdit?.convertsLoanIds || []);
  
  const currencyFormatter = useMemo(() => new Intl.NumberFormat(locale, { style: 'currency', currency: projectCurrency }), [locale, projectCurrency]);

  const pricePerShare = useMemo(() => {
    if (preMoneyValuation && preRoundTotalShares > 0) {
      return preMoneyValuation / preRoundTotalShares;
    }
    return 0;
  }, [preMoneyValuation, preRoundTotalShares]);

  const handleInvestorChange = (index: number, field: keyof NewInvestorInput, value: string | number) => {
    const newInvestors = [...newInvestorInputs];
    (newInvestors[index] as any)[field] = value;
    setNewInvestorInputs(newInvestors);
  };

  const addInvestor = () => {
    setNewInvestorInputs([...newInvestorInputs, { id: crypto.randomUUID(), stakeholderId: '', name: '', investment: 0 }]);
  };

  const removeInvestor = (index: number) => {
    setNewInvestorInputs(newInvestorInputs.filter((_, i) => i !== index));
  };

  const handleShareClassChange = <K extends keyof ShareClass>(field: K, value: ShareClass[K]) => {
    setNewShareClass(prev => ({...prev, [field]: value}));
  };
  
   const handleProvisionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const provisions = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
    handleShareClassChange('protectiveProvisions', provisions);
  };


  const handleLoanSelection = (loanId: string) => {
    setConvertsLoanIds(prev => 
        prev.includes(loanId) ? prev.filter(id => id !== loanId) : [...prev, loanId]
    );
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (preMoneyValuation === '' || pricePerShare <= 0) return;
    
    const newShareholdings: Shareholding[] = newInvestorInputs
        .filter(s => s.name && s.investment > 0)
        .map(inv => ({
            id: inv.id,
            stakeholderId: inv.stakeholderId, // Will be set in App.tsx
            stakeholderName: inv.name,
            shareClassId: newShareClass.id,
            investment: inv.investment,
            shares: Math.round(inv.investment / pricePerShare),
            originalPricePerShare: pricePerShare,
        }));

    const transaction: FinancingRoundTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.FINANCING_ROUND,
      date,
      roundName,
      preMoneyValuation,
      status,
      validFrom,
      validTo: validTo || undefined,
      newShareClass,
      newShareholdings,
      convertsLoanIds: convertsLoanIds.length > 0 ? convertsLoanIds : undefined,
    };
    onSubmit(transaction);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <datalist id="stakeholders-list">
        {stakeholders.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <h3 className="text-xl font-semibold text-primary">{isEditing ? translations.editFinancingRound : translations.addFinancingRound}</h3>
      
      <fieldset>
        <legend className="text-lg font-medium text-primary mb-4 flex items-center gap-2">{translations.investmentRoundDetails} <HelpTooltip text={translations.help.financingRoundDetails} /></legend>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="roundName" className="block text-sm font-medium text-secondary">{translations.roundName}</label>
              <input type="text" id="roundName" value={roundName} onChange={e => setRoundName(e.target.value)} required className={baseInputClasses}/>
            </div>
            <div>
              <label htmlFor="date" className="flex items-center text-sm font-medium text-secondary">
                  {translations.date}
                  <HelpTooltip text={translations.help.date} />
              </label>
              <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
            </div>
            <div className="md:col-span-2">
              <label htmlFor="preMoneyValuation" className="flex items-center text-sm font-medium text-secondary">
                {translations.preMoneyValuation}
                <HelpTooltip text={translations.help.preMoneyValuation} />
              </label>
              <CurrencyInput id="preMoneyValuation" value={preMoneyValuation} onChange={setPreMoneyValuation} required currency={projectCurrency} />
            </div>
             {pricePerShare > 0 && (
                  <div className="md:col-span-2 text-sm text-secondary bg-background p-2 rounded text-center">
                    {translations.pricePerShare}: <strong>{currencyFormatter.format(pricePerShare)}</strong> ({preRoundTotalShares.toLocaleString(locale)} {translations.shares})
                  </div>
                )}
        </div>
      </fieldset>

      <fieldset className="pt-6 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-4 flex items-center gap-2">{translations.newShareClassDetails} <HelpTooltip text={translations.help.newShareClassDetailsFinancing} /></legend>
        <div className="space-y-4 p-4 bg-background-subtle rounded-lg border">
            <div>
                <label htmlFor="shareClassName" className="block text-sm font-medium text-secondary">{translations.shareClassName}</label>
                <input id="shareClassName" type="text" value={newShareClass.name} onChange={e => handleShareClassChange('name', e.target.value)} required className={baseInputClasses}/>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                 <div>
                    <label htmlFor="liqPrefRank" className="flex items-center text-sm font-medium text-secondary">
                        {translations.liquidationPreferenceRank}
                        <HelpTooltip text={translations.help.liquidationPreferenceRank} />
                    </label>
                    <input id="liqPrefRank" type="number" min="1" value={newShareClass.liquidationPreferenceRank} onChange={e => handleShareClassChange('liquidationPreferenceRank', parseInt(e.target.value,10) || 1)} required className={`${baseInputClasses} text-right`}/>
                </div>
                 <div>
                    <label htmlFor="liqPrefFactor" className="flex items-center text-sm font-medium text-secondary">
                      {translations.liquidationPreferenceFactor}
                      <HelpTooltip text={translations.help.liquidationPreferenceFactor} />
                    </label>
                    <input id="liqPrefFactor" type="number" min="1" step="0.1" value={newShareClass.liquidationPreferenceFactor} onChange={e => handleShareClassChange('liquidationPreferenceFactor', parseFloat(e.target.value) || 1)} required className={`${baseInputClasses} text-right`}/>
                </div>
                 <div>
                    <label htmlFor="liqPrefType" className="flex items-center text-sm font-medium text-secondary">
                      {translations.liquidationPreferenceType}
                      <HelpTooltip text={translations.help.liquidationPreferenceType} />
                    </label>
                    <select id="liqPrefType" value={newShareClass.liquidationPreferenceType} onChange={e => handleShareClassChange('liquidationPreferenceType', e.target.value as LiquidationPreferenceType)} required className={baseInputClasses}>
                        {LIQUIDATION_PREFERENCE_TYPES.map(t => <option key={t} value={t}>{translations[snakeToCamel(t) as keyof Translations] as string || t}</option>)}
                    </select>
                </div>
            </div>
             {newShareClass.liquidationPreferenceType === 'CAPPED_PARTICIPATING' && (
                <div>
                    <label htmlFor="participationCapFactor" className="flex items-center text-sm font-medium text-secondary">
                      {translations.participationCapFactor}
                      <HelpTooltip text={translations.help.participationCapFactor} />
                    </label>
                    <input 
                      id="participationCapFactor" 
                      type="number" min="1" 
                      value={newShareClass.participationCapFactor || ''} 
                      onChange={e => handleShareClassChange('participationCapFactor', parseFloat(e.target.value) || undefined)} 
                      className={`${baseInputClasses} text-right`}/>
                </div>
            )}
             <div>
                <label htmlFor="antiDilution" className="flex items-center text-sm font-medium text-secondary">
                  {translations.antiDilutionProtection}
                  <HelpTooltip text={translations.help.antiDilutionProtection} />
                </label>
                <select id="antiDilution" value={newShareClass.antiDilutionProtection} onChange={e => handleShareClassChange('antiDilutionProtection', e.target.value as AntiDilutionProtection)} required className={baseInputClasses}>
                    {ANTI_DILUTION_TYPES.map(t => <option key={t} value={t}>{translations[snakeToCamel(t) as keyof Translations] as string || t}</option>)}
                </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="votesPerShare" className="flex items-center text-sm font-medium text-secondary">
                      {translations.votesPerShare}
                      <HelpTooltip text={translations.help.votesPerShare} />
                    </label>
                    <input id="votesPerShare" type="number" min="0" value={newShareClass.votesPerShare} onChange={e => handleShareClassChange('votesPerShare', parseInt(e.target.value, 10) || 0)} required className={`${baseInputClasses} text-right`}/>
                </div>
                <div>
                    <label htmlFor="protectiveProvisions" className="flex items-center text-sm font-medium text-secondary">
                      {translations.protectiveProvisions}
                      <HelpTooltip text={translations.help.protectiveProvisions} />
                    </label>
                    <input id="protectiveProvisions" type="text" value={(newShareClass.protectiveProvisions || []).join(', ')} onChange={handleProvisionsChange} className={baseInputClasses}/>
                </div>
            </div>
        </div>
      </fieldset>

      <fieldset className="pt-6 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{translations.newInvestors} <HelpTooltip text={translations.help.newInvestors} /></legend>
        <div className="space-y-3">
          {newInvestorInputs.map((investor, index) => (
            <div key={investor.id} className="grid grid-cols-1 md:grid-cols-7 gap-3 p-3 bg-background-subtle rounded-md border border-subtle">
              <div className="md:col-span-3">
                <label className="text-xs text-secondary">{translations.investorName}</label>
                <input type="text" value={investor.name} onChange={e => handleInvestorChange(index, 'name', e.target.value)} placeholder={translations.investorName} className="w-full px-2 py-1 bg-surface border border-strong rounded-md" list="stakeholders-list"/>
              </div>
               <div className="md:col-span-2">
                  <label className="text-xs text-secondary">{translations.investmentAmount}</label>
                  <CurrencyInput id={`investor-investment-${index}`} value={investor.investment || ''} onChange={value => handleInvestorChange(index, 'investment', value === '' ? 0 : value)} currency={projectCurrency} />
                </div>
              <div className="flex items-end gap-2 md:col-span-2">
                 <div className="flex-grow">
                  <label className="text-xs text-secondary">{translations.shares} ({translations.optional})</label>
                  <input type="text" value={pricePerShare > 0 ? (Math.round(investor.investment / pricePerShare)).toLocaleString(locale) : '0'} disabled className="w-full px-2 py-1 bg-background border border-strong rounded-md text-right"/>
                </div>
                <button type="button" onClick={() => removeInvestor(index)} className="p-1 text-danger hover:text-danger-hover hover:bg-danger-subtle-bg rounded-md h-8 w-8 flex-shrink-0 flex items-center justify-center">
                   &times;
                </button>
              </div>
            </div>
          ))}
        </div>
        <button type="button" onClick={addInvestor} className="mt-3 text-sm flex items-center gap-1 text-interactive hover:text-interactive-hover">
          {translations.addInvestor}
        </button>
      </fieldset>
      
      <fieldset className="pt-6 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{translations.convertedLoans} <HelpTooltip text={translations.help.convertedLoans} /></legend>
        
        {convertibleLoans.length > 0 ? (
          <div className="space-y-2">
            {convertibleLoans.map(loan => (
              <div key={loan.id} className="flex items-center gap-3 p-3 bg-background-subtle rounded-md border border-subtle hover:bg-background">
                <input
                  type="checkbox"
                  id={`loan-${loan.id}`}
                  checked={convertsLoanIds.includes(loan.id)}
                  onChange={() => handleLoanSelection(loan.id)}
                  className="h-4 w-4 rounded border-strong text-interactive focus:ring-interactive cursor-pointer accent-interactive"
                />
                <label htmlFor={`loan-${loan.id}`} className="flex-grow text-sm cursor-pointer">
                  <span className="font-medium text-primary">{loan.investorName}</span>
                  <span className="text-secondary ml-2">
                    - {currencyFormatter.format(loan.amount)}
                  </span>
                </label>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-secondary">{translations.noConvertibleLoans}</p>
        )}
      </fieldset>


      <fieldset className="pt-6 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2">{translations.statusAndValidity}</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary">{translations.status}</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} required className={baseInputClasses}>
                <option value={TransactionStatus.DRAFT}>{translations.draft}</option>
                <option value={TransactionStatus.ACTIVE}>{translations.active}</option>
                <option value={TransactionStatus.ARCHIVED}>{translations.archived}</option>
              </select>
            </div>
            <div>
              <label htmlFor="validFrom" className="flex items-center text-sm font-medium text-secondary">
                  {translations.validFrom}
                  <HelpTooltip text={translations.help.validFrom} />
              </label>
              <input type="date" id="validFrom" value={validFrom} onChange={e => setValidFrom(e.target.value)} required className={baseInputClasses}/>
            </div>
            <div>
              <label htmlFor="validTo" className="flex items-center text-sm font-medium text-secondary">
                  {translations.validTo} <span className="text-subtle">({translations.optional})</span>
                  <HelpTooltip text={translations.help.validTo} />
              </label>
              <input type="date" id="validTo" value={validTo} onChange={e => setValidTo(e.target.value)} className={baseInputClasses}/>
            </div>
        </div>
      </fieldset>
      
      <div className="flex justify-end gap-4 pt-6 border-t border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background">{translations.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover disabled:bg-disabled">{isEditing ? translations.update : translations.save}</button>
      </div>
    </form>
  );
};

export default FinancingRoundForm;