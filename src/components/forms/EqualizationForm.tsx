


import React, { useState, useMemo } from 'react';
import type { EqualizationPurchaseTransaction } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import HelpTooltip from '../HelpTooltip';
import CurrencyInput from '../common/CurrencyInput';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useProject } from '../../contexts/ProjectContext';

interface EqualizationFormProps {
  onSubmit: (transaction: EqualizationPurchaseTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: EqualizationPurchaseTransaction;
}

const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive";


function EqualizationForm({ onSubmit, onCancel, transactionToEdit }: EqualizationFormProps) {
  const { t } = useLocalization();
  const { stakeholders, transactions: allTransactions, allShareClasses: allShareClassesMap, projectCurrency } = useProject();
  const allShareClasses = useMemo(() => Array.from(allShareClassesMap.values()), [allShareClassesMap]);
  const isEditing = !!transactionToEdit;

  // Basic Info
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [newStakeholderName, setNewStakeholderName] = useState(transactionToEdit?.newStakeholderName || '');
  
  // Purchase Details
  const [purchasedShares, setPurchasedShares] = useState<number|''>(transactionToEdit?.purchasedShares || '');
  const [shareClassId, setShareClassId] = useState(transactionToEdit?.shareClassId || '');
  const [pricePerShare, setPricePerShare] = useState<number|''>(transactionToEdit?.pricePerShare || '');

  // Equalization Details
  const [equalizationInterestRate, setEqualizationInterestRate] = useState<number|''>(transactionToEdit ? transactionToEdit.equalizationInterestRate * 100 : '');
  const [referenceTransactionId, setReferenceTransactionId] = useState(transactionToEdit?.referenceTransactionId || '');

  // Status
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');
  
  const referenceTransactions = useMemo(() => {
    return allTransactions.filter(tx => tx.type === TransactionType.FOUNDING || tx.type === TransactionType.FINANCING_ROUND);
  }, [allTransactions]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStakeholderName || purchasedShares === '' || !shareClassId || pricePerShare === '' || equalizationInterestRate === '' || !referenceTransactionId) {
        return;
    }

    const transaction: EqualizationPurchaseTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.EQUALIZATION_PURCHASE,
      date,
      status,
      validFrom,
      validTo: validTo || undefined,
      newStakeholderId: '', // Will be set in App.tsx
      newStakeholderName,
      purchasedShares,
      shareClassId,
      pricePerShare,
      equalizationInterestRate: equalizationInterestRate / 100,
      referenceTransactionId,
    };
    onSubmit(transaction);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <datalist id="stakeholders-list">
        {stakeholders.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <h3 className="text-xl font-semibold text-primary">{isEditing ? t.editEqualizationPurchase : t.addEqualizationPurchase}</h3>
      
      <fieldset>
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{t.purchaseDetails} <HelpTooltip text={t.help.purchaseDetails} /></legend>
        <div className="space-y-4 p-4 bg-background-subtle rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="date" className="block text-sm font-medium text-secondary">{t.date}</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
                </div>
                 <div>
                    <label htmlFor="newStakeholderName" className="block text-sm font-medium text-secondary">{t.newStakeholderName}</label>
                    <input type="text" id="newStakeholderName" value={newStakeholderName} onChange={e => setNewStakeholderName(e.target.value)} required className={baseInputClasses} list="stakeholders-list"/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                    <label htmlFor="purchasedShares" className="block text-sm font-medium text-secondary">{t.purchasedShares}</label>
                    <input type="number" min="1" id="purchasedShares" value={purchasedShares} onChange={e => setPurchasedShares(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required className={`${baseInputClasses} text-right`} />
                </div>
                <div>
                    <label htmlFor="shareClassId" className="block text-sm font-medium text-secondary">{t.shareClass}</label>
                    <select id="shareClassId" value={shareClassId} onChange={e => setShareClassId(e.target.value)} required className={baseInputClasses}>
                        <option value="" disabled>{t.selectShareClassToPurchase}</option>
                        {allShareClasses.map(sc => <option key={sc.id} value={sc.id}>{sc.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="pricePerShare" className="block text-sm font-medium text-secondary">{t.pricePerShare}</label>
                    <CurrencyInput id="pricePerShare" value={pricePerShare} onChange={setPricePerShare} required currency={projectCurrency} />
                </div>
            </div>
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-lg font-medium text-primary mb-2 flex items-center gap-2">{t.equalizationDetails} <HelpTooltip text={t.help.equalizationDetails} /></legend>
        <div className="space-y-4 p-4 bg-background-subtle rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="equalizationInterestRate" className="flex items-center text-sm font-medium text-secondary">{t.equalizationInterestRate} <HelpTooltip text={t.help.equalizationInterestRate} /></label>
                     <div className="relative mt-1">
                        <input type="number" id="equalizationInterestRate" min="0" step="any" value={equalizationInterestRate} onChange={e => setEqualizationInterestRate(e.target.value === '' ? '' : parseFloat(e.target.value))} required className={`${baseInputClasses} text-right pr-6`} />
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <span className="text-secondary sm:text-sm">%</span>
                        </div>
                    </div>
                </div>
                 <div>
                    <label htmlFor="referenceTransactionId" className="block text-sm font-medium text-secondary">{t.referenceTransaction}</label>
                    <select id="referenceTransactionId" value={referenceTransactionId} onChange={e => setReferenceTransactionId(e.target.value)} required className={baseInputClasses}>
                        <option value="" disabled>{t.selectReferenceTransaction}</option>
                        {referenceTransactions.map(tx => {
                            const name = tx.type === TransactionType.FOUNDING ? `${t.founding}: ${tx.companyName}` : `${t.financingRound}: ${(tx as any).roundName}`;
                            return <option key={tx.id} value={tx.id}>{name} ({tx.date})</option>
                        })}
                    </select>
                </div>
            </div>
        </div>
      </fieldset>
      
       <fieldset className="pt-4 mt-4 border-t border-subtle">
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

      <div className="flex justify-end gap-4 pt-4 border-t border-subtle">
        <button type="button" onClick={onCancel} className="px-4 py-2 bg-background-subtle text-primary rounded-md hover:bg-background">{t.cancel}</button>
        <button type="submit" className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover">{isEditing ? t.update : t.save}</button>
      </div>
    </form>
  );
};

export default EqualizationForm;