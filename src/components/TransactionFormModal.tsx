

import React, { useMemo } from 'react';
import { TransactionType, Transaction, FoundingTransaction, ConvertibleLoanTransaction, FinancingRoundTransaction, ShareTransferTransaction, Stakeholder, ShareClass, DebtInstrumentTransaction, UpdateShareClassTransaction, CapTable, EqualizationPurchaseTransaction } from '../types';
import CompanyForm from './forms/CompanyForm';
import ConvertibleLoanForm from './forms/ConvertibleLoanForm';
import FinancingRoundForm from './forms/FinancingRoundForm';
import ShareTransferForm from './forms/ShareTransferForm';
import DebtForm from './forms/DebtForm';
import UpdateShareClassForm from './forms/UpdateShareClassForm';
import EqualizationForm from './forms/EqualizationForm';
import CloseIcon from '../styles/icons/CloseIcon';
import { calculateCapTable, getShareClassesAsOf } from '../logic/calculations';
import { useLocalization } from '../contexts/LocalizationContext';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  formType: TransactionType | null;
  onSubmit: (transaction: Transaction) => void;
  transactionToEdit?: Transaction | null;
  transactions: Transaction[];
  stakeholders: Stakeholder[];
  capTable: CapTable | null;
  projectCurrency: string;
}

function TransactionFormModal({ 
    isOpen, 
    onClose, 
    formType, 
    onSubmit, 
    transactionToEdit,
    transactions,
    stakeholders,
    capTable,
    projectCurrency
}: TransactionFormModalProps) {
  const { t } = useLocalization();

  if (!isOpen || !formType) return null;

  const allShareClasses = useMemo<ShareClass[]>(() => {
    if (formType === TransactionType.UPDATE_SHARE_CLASS || formType === TransactionType.EQUALIZATION_PURCHASE) {
        const asOfDate = new Date().toISOString().split('T')[0];
        const shareClassMap = getShareClassesAsOf(transactions, asOfDate);
        return Array.from(shareClassMap.values());
    }
    return [];
  }, [formType, transactions]);


  const renderForm = () => {
    switch (formType) {
      case TransactionType.FOUNDING:
        return <CompanyForm 
                  onSubmit={onSubmit} 
                  onCancel={onClose} 
                  transactionToEdit={transactionToEdit as FoundingTransaction} 
                  stakeholders={stakeholders}
                />;
      case TransactionType.CONVERTIBLE_LOAN:
        return <ConvertibleLoanForm 
                  onSubmit={onSubmit} 
                  onCancel={onClose} 
                  transactionToEdit={transactionToEdit as ConvertibleLoanTransaction} 
                  stakeholders={stakeholders}
                  projectCurrency={projectCurrency}
                />;
      case TransactionType.FINANCING_ROUND: {
        const activeTxs = transactions.filter(tx => tx.status === 'ACTIVE');
        const capTableDate = (transactionToEdit as FinancingRoundTransaction)?.date || new Date().toISOString().split('T')[0];
        const excludeId = transactionToEdit?.id;

        const capTableBefore = calculateCapTable(activeTxs, capTableDate, excludeId);
        const preRoundTotalShares = capTableBefore.totalShares;
        
        const convertedInOtherRounds = new Set<string>();
        activeTxs.forEach(tx => {
            if (tx.type === TransactionType.FINANCING_ROUND && tx.id !== excludeId && tx.convertsLoanIds) {
                tx.convertsLoanIds.forEach(id => convertedInOtherRounds.add(id));
            }
        });

        const convertibleLoans = activeTxs.filter(tx =>
            tx.type === TransactionType.CONVERTIBLE_LOAN && !convertedInOtherRounds.has(tx.id)
        ) as ConvertibleLoanTransaction[];

        return <FinancingRoundForm 
                    onSubmit={onSubmit} 
                    onCancel={onClose} 
                    transactionToEdit={transactionToEdit as FinancingRoundTransaction}
                    preRoundTotalShares={preRoundTotalShares}
                    convertibleLoans={convertibleLoans}
                    stakeholders={stakeholders}
                    projectCurrency={projectCurrency}
                />;
      }
      case TransactionType.SHARE_TRANSFER: {
        return <ShareTransferForm
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    transactionToEdit={transactionToEdit as ShareTransferTransaction}
                    stakeholders={stakeholders}
                    capTable={capTable}
                    projectCurrency={projectCurrency}
                />
      }
      case TransactionType.EQUALIZATION_PURCHASE:
          return <EqualizationForm
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    transactionToEdit={transactionToEdit as EqualizationPurchaseTransaction}
                    stakeholders={stakeholders}
                    allTransactions={transactions}
                    allShareClasses={allShareClasses}
                    projectCurrency={projectCurrency}
                />
      case TransactionType.DEBT_INSTRUMENT:
        return <DebtForm
                  onSubmit={onSubmit}
                  onCancel={onClose}
                  transactionToEdit={transactionToEdit as DebtInstrumentTransaction}
                  projectCurrency={projectCurrency}
               />;
      case TransactionType.UPDATE_SHARE_CLASS: {
        return <UpdateShareClassForm
                    onSubmit={onSubmit}
                    onCancel={onClose}
                    transactionToEdit={transactionToEdit as UpdateShareClassTransaction}
                    allShareClasses={allShareClasses}
                    allTransactions={transactions}
                />
      }
      default:
        return null;
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4"
      onClick={onClose}
    >
      <div 
        className="relative bg-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-secondary hover:text-primary"
          aria-label="Close"
        >
          <CloseIcon />
        </button>
        {renderForm()}
      </div>
    </div>
  );
};

export default TransactionFormModal;
