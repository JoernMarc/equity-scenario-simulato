

import React, { useState, useMemo, useEffect } from 'react';
import type { ShareTransferTransaction, CapTable } from '../../types';
import { TransactionType, TransactionStatus } from '../../types';
import HelpTooltip from '../HelpTooltip';
import CurrencyInput from '../common/CurrencyInput';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useProject } from '../../contexts/ProjectContext';

interface ShareTransferFormProps {
  onSubmit: (transaction: ShareTransferTransaction) => void;
  onCancel: () => void;
  transactionToEdit?: ShareTransferTransaction;
  capTable: CapTable | null;
}

const baseInputClasses = "mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-interactive focus:border-interactive";


function ShareTransferForm({ onSubmit, onCancel, transactionToEdit, capTable }: ShareTransferFormProps) {
  const { t, locale } = useLocalization();
  const { stakeholders, projectCurrency } = useProject();
  const isEditing = !!transactionToEdit;

  // Form State
  const [date, setDate] = useState(transactionToEdit?.date || new Date().toISOString().split('T')[0]);
  const [sellerStakeholderId, setSellerStakeholderId] = useState(transactionToEdit?.sellerStakeholderId || '');
  const [buyerStakeholderName, setBuyerStakeholderName] = useState(transactionToEdit?.buyerStakeholderName || '');
  const [shareClassId, setShareClassId] = useState(transactionToEdit?.shareClassId || '');
  const [numberOfShares, setNumberOfShares] = useState<number | ''>(transactionToEdit?.numberOfShares || '');
  const [pricePerShare, setPricePerShare] = useState<number | ''>(transactionToEdit?.pricePerShare || '');
  
  // Optional Additional Payment
  const [additionalPaymentAmount, setAdditionalPaymentAmount] = useState<number | ''>(transactionToEdit?.additionalPayment?.amount || '');
  const [additionalPaymentDesc, setAdditionalPaymentDesc] = useState(transactionToEdit?.additionalPayment?.description || '');

  // Status
  const [status, setStatus] = useState<TransactionStatus>(transactionToEdit?.status || TransactionStatus.DRAFT);
  const [validFrom, setValidFrom] = useState(transactionToEdit?.validFrom || new Date().toISOString().split('T')[0]);
  const [validTo, setValidTo] = useState(transactionToEdit?.validTo || '');
  
  // Derived data for form logic
  const potentialSellers = useMemo(() => {
    if (!capTable) return [];
    return capTable.entries
        .filter(entry => entry.shares > 0)
        .map(entry => ({ id: entry.stakeholderId, name: entry.stakeholderName }))
        .filter((value, index, self) => self.findIndex(v => v.id === value.id) === index) // Unique stakeholders
        .sort((a, b) => a.name.localeCompare(b.name));
  }, [capTable]);

  const sellerHoldings = useMemo(() => {
    if (!capTable || !sellerStakeholderId) return [];
    return capTable.entries.filter(entry => entry.stakeholderId === sellerStakeholderId && entry.shares > 0);
  }, [capTable, sellerStakeholderId]);

  const selectedHolding = useMemo(() => {
      return sellerHoldings.find(h => h.shareClassId === shareClassId) || null;
  }, [sellerHoldings, shareClassId]);
  
  // Reset share class if seller changes and doesn't own the selected class
  useEffect(() => {
      if(sellerStakeholderId && shareClassId) {
          const sellerOwnsSelectedClass = sellerHoldings.some(h => h.shareClassId === shareClassId);
          if(!sellerOwnsSelectedClass) {
              setShareClassId('');
              setNumberOfShares('');
          }
      }
  }, [sellerStakeholderId, sellerHoldings, shareClassId]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sellerStakeholderId || !buyerStakeholderName || !shareClassId || numberOfShares === '' || pricePerShare === '') {
        return;
    }

    const transaction: ShareTransferTransaction = {
      id: transactionToEdit?.id || crypto.randomUUID(),
      type: TransactionType.SHARE_TRANSFER,
      date, status, validFrom, validTo: validTo || undefined,
      
      sellerStakeholderId,
      buyerStakeholderName,
      buyerStakeholderId: '', // Will be set in App.tsx
      
      shareClassId,
      numberOfShares,
      pricePerShare,

      additionalPayment: additionalPaymentAmount !== '' && additionalPaymentDesc
        ? { amount: additionalPaymentAmount, description: additionalPaymentDesc }
        : undefined,
    };
    onSubmit(transaction);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <datalist id="stakeholders-list">
        {stakeholders.map(s => <option key={s.id} value={s.name} />)}
      </datalist>

      <h3 className="text-xl font-semibold text-primary flex items-center gap-2">{isEditing ? t.editShareTransfer : t.addShareTransfer} <HelpTooltip text={t.help.shareTransfer} /></h3>
      
      <fieldset>
        <legend className="text-lg font-medium text-primary mb-2">{t.transferDetails}</legend>
        <div className="space-y-4 p-4 bg-background-subtle rounded-lg border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div>
                    <label htmlFor="date" className="block text-sm font-medium text-secondary">{t.date}</label>
                    <input type="date" id="date" value={date} onChange={e => setDate(e.target.value)} required className={baseInputClasses}/>
                </div>
                <div>
                    <label htmlFor="seller" className="block text-sm font-medium text-secondary">{t.seller}</label>
                    <select id="seller" value={sellerStakeholderId} onChange={e => setSellerStakeholderId(e.target.value)} required className={baseInputClasses} disabled={isEditing}>
                        <option value="" disabled>{t.selectSeller}</option>
                        {potentialSellers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="buyer" className="block text-sm font-medium text-secondary">{t.buyer}</label>
                    <input type="text" id="buyer" value={buyerStakeholderName} onChange={e => setBuyerStakeholderName(e.target.value)} required className={baseInputClasses} list="stakeholders-list"/>
                </div>
            </div>
            
            <div className="pt-4 border-t border-strong">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div>
                        <label htmlFor="shareClassToTransfer" className="block text-sm font-medium text-secondary">{t.shareClassToTransfer}</label>
                        <select id="shareClassToTransfer" value={shareClassId} onChange={e => setShareClassId(e.target.value)} required className={baseInputClasses} disabled={!sellerStakeholderId}>
                            <option value="" disabled>{t.selectShareClass}</option>
                            {sellerHoldings.map(h => <option key={h.shareClassId} value={h.shareClassId}>{h.shareClassName}</option>)}
                        </select>
                        {selectedHolding && (
                            <p className="text-xs text-secondary mt-1">{t.sharesOwned}: {selectedHolding.shares.toLocaleString()}</p>
                        )}
                    </div>
                    <div>
                        <label htmlFor="numberOfShares" className="block text-sm font-medium text-secondary">{t.numberOfShares}</label>
                        <input type="number" min="1" max={selectedHolding?.shares} id="numberOfShares" value={numberOfShares} onChange={e => setNumberOfShares(e.target.value === '' ? '' : parseInt(e.target.value, 10))} required className={`${baseInputClasses} text-right`} disabled={!shareClassId} />
                    </div>
                    <div>
                        <label htmlFor="pricePerShare" className="block text-sm font-medium text-secondary">{t.pricePerShare}</label>
                        <CurrencyInput id="pricePerShare" value={pricePerShare} onChange={setPricePerShare} required currency={projectCurrency} />
                    </div>
                </div>
            </div>

            <div className="pt-4 border-t border-strong">
                <p className="text-base font-medium text-primary mb-2">{t.additionalPayment} ({t.optional})</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="additionalPaymentAmount" className="block text-sm font-medium text-secondary">{t.investmentAmount}</label>
                        <CurrencyInput id="additionalPaymentAmount" value={additionalPaymentAmount} onChange={setAdditionalPaymentAmount} currency={projectCurrency} />
                    </div>
                    <div>
                        <label htmlFor="additionalPaymentDesc" className="block text-sm font-medium text-secondary">{t.paymentDescription}</label>
                        <input type="text" id="additionalPaymentDesc" value={additionalPaymentDesc} onChange={e => setAdditionalPaymentDesc(e.target.value)} className={baseInputClasses}/>
                    </div>
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

export default ShareTransferForm;
