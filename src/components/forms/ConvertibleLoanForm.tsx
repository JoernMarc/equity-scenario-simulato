

import React, { useState } from 'react';
import type { ConvertibleLoanTransaction } from '../../types';
import { TransactionType, TransactionStatus, ConversionMechanism } from '../../types';
import type { Translations } from '../../i18n';
import HelpTooltip from '../HelpTooltip';
import { snakeToCamel } from '../../logic/utils';
import CurrencyInput from '../common/CurrencyInput';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useProject } from '../../contexts/ProjectContext';

interface ConvertibleLoanFormProps {
  onSubmit: (transaction: ConvertibleLoanTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: ConvertibleLoanTransaction;
}

const seniorityLevels: ConvertibleLoanTransaction['seniority'][] = ['SENIOR_UNSECURED', 'SUBORDINATED'];

function ConvertibleLoanForm({ onSubmit, onCancel, transactionToEdit }: ConvertibleLoanFormProps) {
  const { t, locale } = useLocalization();
  const { stakeholders, projectCurrency } = useProject();
  const isEditing = !!transactionToEdit;

  // Basic info
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [investorName, setInvestorName] = useState(transactionToEdit?.investorName || '');
  const [amount, setAmount] = useState<number | ''>(transactionToEdit?.amount || '');
  const [interestRate, setInterestRate] = useState<number | ''>(
    transactionToEdit?.interestRate ? transactionToEdit.interestRate * 100 : ''
  );
  
  // Conversion mechanism and its fields
  const [conversionMechanism, setConversionMechanism] = useState<ConversionMechanism>(
    transactionToEdit?.conversionMechanism || ConversionMechanism.CAP_AND_DISCOUNT
  );
  const [valuationCap, setValuationCap] = useState<number | ''>(transactionToEdit?.valuationCap || '');
  const [discount, setDiscount] = useState<number | ''>(
    transactionToEdit?.discount ? transactionToEdit.discount * 100 : ''
  );
  const [fixedConversionPrice, setFixedConversionPrice] = useState<number | ''>(transactionToEdit?.fixedConversionPrice || '');
  const [ratioShares, setRatioShares] = useState<number | ''>(transactionToEdit?.ratioShares || '');
  const [ratioAmount, setRatioAmount] = useState<number | ''>(transactionToEdit?.ratioAmount || '');

  // Seniority
  const [seniority, setSeniority] = useState<ConvertibleLoanTransaction['seniority']>(
    transactionToEdit?.seniority || 'SUBORDINATED'
  );

  // Status
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === '' || !investorName) return;

    const transaction: ConvertibleLoanTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.CONVERTIBLE_LOAN,
      stakeholderId: transactionToEdit?.stakeholderId || '', // This will be set in App.tsx
      date,
      investorName,
      amount: amount,
      interestRate: interestRate !== '' ? interestRate / 100 : undefined,
      status,
      validFrom,
      validTo: validTo || undefined,
      seniority,
      
      conversionMechanism,
      
      valuationCap: conversionMechanism === ConversionMechanism.CAP_AND_DISCOUNT && valuationCap !== '' ? valuationCap : undefined,
      discount: conversionMechanism === ConversionMechanism.CAP_AND_DISCOUNT && discount !== '' ? discount / 100 : undefined,
      
      fixedConversionPrice: conversionMechanism === ConversionMechanism.FIXED_PRICE && fixedConversionPrice !== '' ? fixedConversionPrice : undefined,

      ratioShares: conversionMechanism === ConversionMechanism.FIXED_RATIO && ratioShares !== '' ? ratioShares : undefined,
      ratioAmount: conversionMechanism === ConversionMechanism.FIXED_RATIO && ratioAmount !== '' ? ratioAmount : undefined,
    };
    onSubmit(transaction);
  };

  const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <datalist id="stakeholders-list">
        {stakeholders.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">{isEditing ? t.editConvertible : t.addConvertible} <HelpTooltip text={t.help.convertibleLoan} /></h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="investorName" className="block text-sm font-medium text-secondary">{t.investorName}</label>
          <input type="text" id="investorName" value={investorName} onChange={e => setInvestorName(e.target.value)} required className={baseInputClasses} list="stakeholders-list" />
        </div>
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-secondary">{t.date}</label>
          <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
        </div>
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-secondary">{t.investmentAmount}</label>
          <CurrencyInput value={amount} onChange={setAmount} required id="amount" currency={projectCurrency} />
        </div>
        <div>
          <label htmlFor="interestRate" className="block text-sm font-medium text-secondary">{t.interestRate} <span className="text-subtle">({t.optional})</span></label>
          <input type="number" id="interestRate" min="0" value={interestRate} onChange={e => setInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`${baseInputClasses} text-right`}/>
        </div>
         <div>
            <label htmlFor="seniority" className="block text-sm font-medium text-secondary">{t.seniority}</label>
            <select id="seniority" value={seniority} onChange={e => setSeniority(e.target.value as ConvertibleLoanTransaction['seniority'])} required className={baseInputClasses}>
                {seniorityLevels.map(level => {
                    const key = snakeToCamel(level) as keyof Translations;
                    return <option key={level} value={level}>{(t[key] as string) || level}</option>
                })}
            </select>
        </div>
        <div>
            <label htmlFor="conversionMechanism" className="flex items-center text-sm font-medium text-secondary">
                {t.conversionMechanism}
                <HelpTooltip text={t.help.conversionMechanism} />
            </label>
            <select id="conversionMechanism" value={conversionMechanism} onChange={e => setConversionMechanism(e.target.value as ConversionMechanism)} required className={baseInputClasses}>
                <option value={ConversionMechanism.CAP_AND_DISCOUNT}>{t.capAndDiscount}</option>
                <option value={ConversionMechanism.FIXED_PRICE}>{t.fixedPrice}</option>
                <option value={ConversionMechanism.FIXED_RATIO}>{t.fixedRatio}</option>
            </select>
        </div>
      </div>
      
      {conversionMechanism === ConversionMechanism.CAP_AND_DISCOUNT && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-background-subtle rounded-md border border-subtle">
            <div>
              <label htmlFor="valuationCap" className="flex items-center text-sm font-medium text-secondary">
                {t.valuationCap} <span className="text-subtle">({t.optional})</span>
                <HelpTooltip text={t.help.valuationCap} />
              </label>
              <CurrencyInput value={valuationCap} onChange={setValuationCap} id="valuationCap" currency={projectCurrency} />
            </div>
            <div>
              <label htmlFor="discount" className="flex items-center text-sm font-medium text-secondary">
                {t.discount} <span className="text-subtle">({t.optional})</span>
                <HelpTooltip text={t.help.discount} />
              </label>
              <input type="number" id="discount" min="0" max="100" value={discount} onChange={e => setDiscount(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`${baseInputClasses} text-right`}/>
            </div>
        </div>
      )}

      {conversionMechanism === ConversionMechanism.FIXED_PRICE && (
        <div className="p-4 bg-background-subtle rounded-md border border-subtle">
            <label htmlFor="fixedConversionPrice" className="flex items-center text-sm font-medium text-secondary">
                {t.fixedConversionPrice.replace('{currency}', projectCurrency)}
                <HelpTooltip text={t.help.fixedPrice} />
            </label>
            <CurrencyInput value={fixedConversionPrice} onChange={setFixedConversionPrice} id="fixedConversionPrice" required currency={projectCurrency} />
        </div>
      )}

      {conversionMechanism === ConversionMechanism.FIXED_RATIO && (
        <div className="p-4 bg-background-subtle rounded-md border border-subtle">
             <label className="flex items-center text-sm font-medium text-secondary mb-2">
                {t.fixedRatio}
                <HelpTooltip text={t.help.fixedRatio} />
            </label>
            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label htmlFor="ratioShares" className="text-xs text-secondary">{t.ratioShares}</label>
                    <input type="number" id="ratioShares" min="1" value={ratioShares} onChange={e => setRatioShares(e.target.value === '' ? '' : parseFloat(e.target.value))} className={`${baseInputClasses} text-right`} required />
                </div>
                <div className="flex-1">
                    <label htmlFor="ratioAmount" className="text-xs text-secondary">{t.forAmount.replace('{currency}', projectCurrency)}</label>
                    <CurrencyInput value={ratioAmount} onChange={setRatioAmount} id="ratioAmount" required currency={projectCurrency} />
                </div>
            </div>
        </div>
      )}
      
      <div className="pt-4 mt-4 border-t border-subtle">
        <h4 className="text-lg font-medium text-primary mb-2">{t.statusAndValidity}</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-secondary">{t.status}</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} required className={baseInputClasses}>
                <option value={TransactionStatus.DRAFT}>{t.draft}</option>
                <option value={TransactionStatus.ACTIVE}>{t.active}</option>
                <option value={TransactionStatus.ARCHIVED}>{t.archived}</option>
              </select>
            </div>
            <div>
              <label htmlFor="validFrom" className="block text-sm font-medium text-secondary">{t.validFrom}</label>
              <input type="date" id="validFrom" value={validFrom} onChange={e => setValidFrom(e.target.value)} required className={baseInputClasses}/>
            </div>
            <div>
              <label htmlFor="validTo" className="block text-sm font-medium text-secondary">{t.validTo} <span className="text-subtle">({t.optional})</span></label>
              <input type="date" id="validTo" value={validTo} onChange={e => setValidTo(e.target.value)} className={baseInputClasses}/>
            </div>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4 border-t border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background">{t.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover">{isEditing ? t.update : t.save}</button>
      </div>
    </form>
  );
};

export default ConvertibleLoanForm;
