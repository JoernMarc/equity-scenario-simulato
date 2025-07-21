

import React, { useState } from 'react';
import type { DebtInstrumentTransaction } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import type { Translations } from '../../i18n';
import { snakeToCamel } from '../../logic/utils';
import HelpTooltip from '../HelpTooltip';
import CurrencyInput from '../common/CurrencyInput';
import { useLocalization } from '../../contexts/LocalizationContext';

interface DebtFormProps {
  onSubmit: (transaction: DebtInstrumentTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: DebtInstrumentTransaction;
  projectCurrency: string;
}

const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive";

const seniorityLevels: DebtInstrumentTransaction['seniority'][] = ['SENIOR_SECURED', 'SENIOR_UNSECURED', 'SUBORDINATED'];

function DebtForm({ onSubmit, onCancel, transactionToEdit, projectCurrency }: DebtFormProps) {
  const { t, locale } = useLocalization();
  const isEditing = !!transactionToEdit;

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
      <h3 className="text-xl font-semibold text-primary">{isEditing ? t.editDebtInstrument : t.addDebtInstrument}</h3>
      
      <fieldset>
        <legend className="text-lg font-medium text-primary mb-4 flex items-center gap-2">{t.debtDetails} <HelpTooltip text={t.help.debtInstrument} /></legend>
        <div className="space-y-4 p-4 bg-background-subtle rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="lenderName" className="block text-sm font-medium text-secondary">{t.lenderName}</label>
                    <input type="text" id="lenderName" value={lenderName} onChange={e => setLenderName(e.target.value)} required className={baseInputClasses}/>
                </div>
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-secondary">{t.date}</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-secondary">{t.investmentAmount}</label>
                    <CurrencyInput id="amount" value={amount} onChange={setAmount} required currency={projectCurrency} />
                </div>
                <div>
                    <label htmlFor="interestRate" className="block text-sm font-medium text-secondary">{t.interestRate}</label>
                    <div className="relative mt-1">
                        <input type="number" id="interestRate" min="0" step="any" value={interestRate} onChange={e => setInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required className={`${baseInputClasses} text-right pr-6`} />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-secondary sm:text-sm">%</span>
                        </div>
                    </div>
                </div>
                <div>
                    <label htmlFor="seniority" className="block text-sm font-medium text-secondary">{t.seniority}</label>
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

      <fieldset className="pt-6 border-t border-subtle">
        <legend className="text-lg font-medium text-primary mb-2">{t.statusAndValidity}</legend>
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
      </fieldset>
      
      <div className="flex justify-end gap-4 pt-6 border-t border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background">{t.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover">{isEditing ? t.update : t.save}</button>
      </div>
    </form>
  );
};

export default DebtForm;
