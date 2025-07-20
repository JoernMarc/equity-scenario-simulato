
import React, { useState } from 'react';
import type { DebtInstrumentTransaction, Language } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import type { Translations } from '../../i18n';
import { snakeToCamel } from '../../logic/utils';
import HelpTooltip from '../HelpTooltip';
import CurrencyInput from '../common/CurrencyInput';

interface DebtFormProps {
  onSubmit: (transaction: DebtInstrumentTransaction) => void;
  onCancel: () => void;
  translations: Translations;
  transactionToEdit?: DebtInstrumentTransaction;
  projectCurrency: string;
  language: Language;
}

const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-theme-surface border border-theme-strong rounded-md shadow-sm focus:outline-none focus:ring-theme-interactive focus:border-theme-interactive";

const seniorityLevels: DebtInstrumentTransaction['seniority'][] = ['SENIOR_SECURED', 'SENIOR_UNSECURED', 'SUBORDINATED'];

function DebtForm({ onSubmit, onCancel, translations, transactionToEdit, projectCurrency, language }: DebtFormProps) {
  const isEditing = !!transactionToEdit;
  const t = translations;
  const locale = language === 'de' ? 'de-DE' : 'en-US';

  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [lenderName, setLenderName] = useState(transactionToEdit?.lenderName || '');
  const [amount, setAmount] = useState<number|''>(transactionToEdit?.amount || '');
  const [interestRate, setInterestRate] = useState<number|''>(transactionToEdit ? transactionToEdit.interestRate * 100 : '');
  const [seniority, setSeniority] = useState<DebtInstrumentTransaction['seniority']>(transactionToEdit?.seniority || 'SENIOR_UNSECURED');
  
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lenderName || amount === '' || interestRate === '') return;

    const transaction: DebtInstrumentTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.DEBT_INSTRUMENT,
      date,
      status,
      validFrom,
      validTo: validTo || undefined,
      lenderName,
      amount: amount,
      interestRate: interestRate / 100,
      seniority
    };
    onSubmit(transaction);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <h3 className="text-xl font-semibold text-theme-primary">{isEditing ? t.editDebtInstrument : t.addDebtInstrument}</h3>
      
      <fieldset>
        <legend className="text-lg font-medium text-theme-primary mb-4 flex items-center gap-2">{t.debtDetails} <HelpTooltip text={t.help.debtInstrument} /></legend>
        <div className="space-y-4 p-4 bg-theme-subtle rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lenderName" className="block text-sm font-medium text-theme-secondary">{t.lenderName}</label>
                    <input type="text" id="lenderName" value={lenderName} onChange={e => setLenderName(e.target.value)} required className={baseInputClasses}/>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-theme-secondary">{t.date}</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-theme-secondary">{t.investmentAmount}</label>
                    <CurrencyInput id="amount" value={amount} onChange={setAmount} required currency={projectCurrency} locale={locale} />
                </div>
                <div>
                    <label htmlFor="interestRate" className="block text-sm font-medium text-theme-secondary">{t.interestRate}</label>
                    <div className="relative mt-1">
                        <input type="number" id="interestRate" min="0" step="any" value={interestRate} onChange={e => setInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required className={`${baseInputClasses} text-right pr-6`} />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-theme-secondary sm:text-sm">%</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="seniority" className="block text-sm font-medium text-theme-secondary">{t.seniority}</label>
                    <select id="seniority" value={seniority} onChange={e => setSeniority(e.target.value as DebtInstrumentTransaction['seniority'])} required className={baseInputClasses}>
                        {seniorityLevels.map(level => {
                             const key = snakeToCamel(level) as keyof Translations;
                             return <option key={level} value={level}>{t[key] as string || level}</option>
                        })}
                    </select>
                </div>
            </div>
        </div>
      </fieldset>

      <fieldset className="pt-6 border-t border-theme-subtle">
        <legend className="text-lg font-medium text-theme-primary mb-2">{t.statusAndValidity}</legend>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-theme-secondary">{t.status}</label>
              <select id="status" value={status} onChange={e => setStatus(e.target.value as TransactionStatus)} required className={baseInputClasses}>
                <option value={TransactionStatus.DRAFT}>{t.draft}</option>
                <option value={TransactionStatus.ACTIVE}>{t.active}</option>
                <option value={TransactionStatus.ARCHIVED}>{t.archived}</option>
              </select>
            </div>
            <div>
              <label htmlFor="validFrom" className="block text-sm font-medium text-theme-secondary">{t.validFrom}</label>
              <input type="date" id="validFrom" value={validFrom} onChange={e => setValidFrom(e.target.value)} required className={baseInputClasses}/>
            </div>
            <div>
              <label htmlFor="validTo" className="block text-sm font-medium text-theme-secondary">{t.validTo} <span className="text-theme-subtle">({t.optional})</span></label>
              <input type="date" id="validTo" value={validTo} onChange={e => setValidTo(e.target.value)} className={baseInputClasses}/>
            </div>
        </div>
      </fieldset>
      
      <div className="flex justify-end gap-4 pt-6 border-t border-theme-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-theme-subtle text-theme-primary rounded-md hover:bg-theme-background">{t.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-theme-interactive text-theme-on-interactive rounded-md hover:bg-theme-interactive-hover">{isEditing ? t.update : t.save}</button>
      </div>
    </form>
  );
};

export default DebtForm;
