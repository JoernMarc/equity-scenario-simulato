


import { useMemo } from 'react';
import type { Transaction, FoundingTransaction, ConvertibleLoanTransaction, FinancingRoundTransaction, ShareTransferTransaction, ShareClass, DebtInstrumentTransaction, UpdateShareClassTransaction, EqualizationPurchaseTransaction } from '../../types';
import { TransactionType, TransactionStatus, ConversionMechanism } from '../../types';
import type { Translations } from '../i18n';
import PencilIcon from '../styles/icons/PencilIcon';
import TrashIcon from '../styles/icons/TrashIcon';
import { getShareClassesAsOf } from '../logic/calculations';
import { snakeToCamel } from '../logic/utils';
import { useLocalization } from '../contexts/LocalizationContext';
import { useProject } from '../contexts/ProjectContext';

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  isFoundingDeletable: boolean;
  searchQuery: string;
  simulationDate: string;
}

const getIsUsed = (tx: Transaction, simulationDate: string): boolean => {
    if (tx.status !== TransactionStatus.ACTIVE) {
        return false;
    }
    const simDate = new Date(simulationDate);
    simDate.setHours(0, 0, 0, 0);

    const validFromDate = new Date(tx.validFrom);
    
    if (validFromDate > simDate) {
        return false;
    }

    if (tx.validTo) {
        const validToDate = new Date(tx.validTo);
        if (validToDate < simDate) {
            return false;
        }
    }

    return true;
};

function TransactionCard({ title, date, locale, actions, children }: { title: string; date: string; locale: string; actions?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="bg-surface p-4 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-interactive pr-4">{title}</h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-secondary">{new Date(date).toLocaleDateString(locale)}</span>
          {actions}
        </div>
      </div>
      <div className="text-sm space-y-3">{children}</div>
    </div>
  );
}

const DetailItem = ({ label, value, isNumeric = false, unit, isCurrency=false, locale='en-US', projectCurrency = 'EUR' }: { label: string, value: React.ReactNode, isNumeric?: boolean, unit?: string, isCurrency?: boolean, locale?: string, projectCurrency?: string }) => {
    let displayValue = value;
    if(isCurrency && typeof value === 'number') {
        displayValue = value.toLocaleString(locale, { style: 'currency', currency: projectCurrency, maximumFractionDigits: 2 });
    }

    return (
        <div className="grid grid-cols-3 gap-2">
            <dt className="font-semibold text-secondary col-span-1">{label}</dt>
            <dd className={`text-primary col-span-2 ${isNumeric ? 'text-right font-mono' : ''}`}>
                 {displayValue} {unit && <span className="text-secondary ml-1">{unit}</span>}
            </dd>
        </div>
    );
}


const ShareClassDetails = ({ shareClass, translations }: { shareClass: ShareClass, translations: Translations }) => {
    const liqPrefTypeKey = snakeToCamel(shareClass.liquidationPreferenceType) as keyof Translations;
    const liqPrefType = (translations[liqPrefTypeKey] as string) || shareClass.liquidationPreferenceType;

    const antiDilutionTypeKey = snakeToCamel(shareClass.antiDilutionProtection) as keyof Translations;
    const antiDilutionType = (translations[antiDilutionTypeKey] as string) || shareClass.antiDilutionProtection;

    return (
        <div className="p-3 bg-background rounded-md border border-subtle mt-2 space-y-2">
            <h5 className="font-bold text-primary">{shareClass.name}</h5>
             <DetailItem label={translations.liquidationPreference} value={`${shareClass.liquidationPreferenceRank} / ${shareClass.liquidationPreferenceFactor}x / ${liqPrefType} ${shareClass.liquidationPreferenceType === 'CAPPED_PARTICIPATING' ? `(${shareClass.participationCapFactor}x Cap)` : ''}`} />
             <DetailItem label={translations.antiDilutionProtection} value={antiDilutionType} />
             <DetailItem label={translations.votesPerShare} value={shareClass.votesPerShare} />
        </div>
    );
};


function TransactionList({ onEdit, onDelete, isFoundingDeletable, searchQuery, simulationDate }: TransactionListProps) {
  const { t: translations, locale } = useLocalization();
  const { transactions, stakeholders, projectCurrency } = useProject();

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return transactions.filter(tx => {
      const txString = JSON.stringify(tx).toLowerCase();
      return txString.includes(lowerCaseQuery);
    });
  }, [searchQuery, transactions]);

  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-surface rounded-lg shadow-sm border border-subtle">
        <p className="text-secondary">{translations.noTransactions}</p>
      </div>
    );
  }

  if (filteredTransactions.length === 0) {
      return (
        <div className="text-center py-10 px-4 bg-surface rounded-lg shadow-sm border border-subtle">
            <p className="text-secondary">{translations.noSearchResults}</p>
        </div>
      );
  }


  const allShareClassesAsOfNow = useMemo(() => {
    return getShareClassesAsOf(transactions, new Date().toISOString().split('T')[0]);
  }, [transactions]);

  const renderTransactionDetails = (tx: Transaction) => {
    const isFounding = tx.type === TransactionType.FOUNDING;
    const canDeleteFounding = isFounding && isFoundingDeletable;

    const actionButtons = (
      <div className="flex items-center gap-1 border-l border-subtle ml-2 pl-2">
        <button 
            onClick={() => onEdit(tx)} 
            className="p-1 text-secondary hover:text-interactive hover:bg-background-subtle rounded-md"
            aria-label={translations.edit}
            title={translations.edit}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button 
            onClick={() => onDelete(tx.id)} 
            disabled={isFounding && !canDeleteFounding}
            className="p-1 text-secondary hover:text-danger hover:bg-background-subtle rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label={translations.delete}
            title={isFounding && !canDeleteFounding ? translations.deleteDisabledTooltip : translations.delete}
        >
          <TrashIcon className="w-4 h-4" />
        </button>
      </div>
    );

    const isUsed = getIsUsed(tx, simulationDate);
    const statusText = {
      [TransactionStatus.DRAFT]: translations.draft,
      [TransactionStatus.ACTIVE]: translations.active,
      [TransactionStatus.ARCHIVED]: translations.archived,
    }[tx.status];

    const statusBadgeColor = {
      [TransactionStatus.DRAFT]: 'bg-background-subtle text-secondary',
      [TransactionStatus.ACTIVE]: 'bg-success-subtle-bg text-success-subtle-text',
      [TransactionStatus.ARCHIVED]: 'bg-danger-subtle-bg text-danger-subtle-text',
    }[tx.status];

    const metaInfo = (
        <div className="mt-3 pt-3 border-t border-subtle flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-secondary">
            <div className="flex items-center gap-2">
                <strong>{translations.status}:</strong>
                <span className={`px-2 py-0.5 rounded-full font-medium text-xs ${statusBadgeColor}`}>
                    {statusText}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <strong>{translations.validFrom}:</strong>
                <span>{new Date(tx.validFrom).toLocaleDateString(locale)}</span>
            </div>
            {tx.validTo && (
                 <div className="flex items-center gap-2">
                    <strong>{translations.validTo}:</strong>
                    <span>{new Date(tx.validTo).toLocaleDateString(locale)}</span>
                </div>
            )}
            <div className="flex items-center gap-2">
                <input type="checkbox" checked={isUsed} readOnly className="h-4 w-4 rounded border-strong accent-interactive" id={`used-checkbox-${tx.id}`} />
                <label htmlFor={`used-checkbox-${tx.id}`} className="font-medium">{translations.used}</label>
            </div>
        </div>
    );

    switch (tx.type) {
      case TransactionType.FOUNDING: {
        const foundingTx = tx as FoundingTransaction;
        const shareClassMap = new Map(foundingTx.shareClasses.map(sc => [sc.id, sc.name]));
        return (
          <TransactionCard title={`${translations.founding}: ${foundingTx.companyName}`} date={foundingTx.date} key={tx.id} actions={actionButtons} locale={locale}>
            <DetailItem label={translations.legalForm} value={foundingTx.legalForm} />
            <p className="font-semibold mt-2 text-secondary">{translations.shareholdings}:</p>
            <ul className="space-y-1 text-secondary">
              {foundingTx.shareholdings.map(sh => {
                const pricePerShare = (sh.investment ?? 0) > 0 && sh.shares > 0 ? (sh.investment ?? 0) / sh.shares : 0;
                return (
                 <li key={sh.id} className="flex justify-between items-baseline p-1 bg-background-subtle rounded-md">
                    <span className="text-primary">
                      {sh.stakeholderName}: {sh.shares.toLocaleString(locale)} {shareClassMap.get(sh.shareClassId) || 'N/A'}
                      {(sh.investment ?? 0) > 0 && ` (${(sh.investment ?? 0).toLocaleString(locale, {style:'currency', currency: projectCurrency})})`}
                    </span>
                    {pricePerShare > 0 && 
                      <span className="text-secondary text-xs font-mono">
                        {pricePerShare.toLocaleString(locale, {style:'currency', currency: projectCurrency, minimumFractionDigits: 2, maximumFractionDigits: 4 })}/{translations.perShare}
                      </span>
                    }
                  </li>
                );
              })}
            </ul>
            {metaInfo}
          </TransactionCard>
        );
      }
      case TransactionType.CONVERTIBLE_LOAN: {
        const loanTx = tx as ConvertibleLoanTransaction;
        const mechanism = loanTx.conversionMechanism || ConversionMechanism.CAP_AND_DISCOUNT;
        
        let mechanismDetails: React.ReactNode;
        switch(mechanism) {
            case ConversionMechanism.FIXED_PRICE:
                mechanismDetails = <DetailItem label={translations.fixedConversionPrice} value={loanTx.fixedConversionPrice} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>;
                break;
            case ConversionMechanism.FIXED_RATIO:
                mechanismDetails = <DetailItem label={translations.fixedRatio} value={`${loanTx.ratioShares?.toLocaleString(locale) || '?'} ${translations.shares} / ${loanTx.ratioAmount?.toLocaleString(locale,{style:'currency',currency:projectCurrency}) || '?'}`} />;
                break;
            case ConversionMechanism.CAP_AND_DISCOUNT:
            default:
                mechanismDetails = <>
                    {loanTx.valuationCap && <DetailItem label={translations.valuationCap} value={loanTx.valuationCap} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>}
                    {loanTx.discount && <DetailItem label={translations.discount} value={`${(loanTx.discount * 100).toFixed(0)}%`} isNumeric />}
                </>;
                break;
        }
        
        const seniorityKey = snakeToCamel(loanTx.seniority || 'SUBORDINATED') as keyof Translations;
        const seniorityText = (translations[seniorityKey] as string) || loanTx.seniority;

        return (
          <TransactionCard title={translations.convertibleLoan} date={loanTx.date} key={tx.id} actions={actionButtons} locale={locale}>
            <DetailItem label={translations.investorName} value={loanTx.investorName} />
            <DetailItem label={translations.investmentAmount} value={loanTx.amount} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency} />
            {loanTx.interestRate && <DetailItem label={translations.interestRate} value={`${(loanTx.interestRate * 100).toFixed(1)}%`} isNumeric />}
            
            <div className="mt-2 pt-2 border-t border-subtle">
              {mechanismDetails}
              <DetailItem label={translations.seniority} value={seniorityText} />
            </div>

            {metaInfo}
          </TransactionCard>
        );
      }
      case TransactionType.FINANCING_ROUND: {
        const roundTx = tx as FinancingRoundTransaction;
        const totalInvestment = roundTx.newShareholdings.reduce((sum, s) => sum + (s.investment || 0), 0);
        const postMoneyValuation = roundTx.preMoneyValuation + totalInvestment;
        
        const convertedLoans = (roundTx.convertsLoanIds || [])
          .map(id => transactions.find(t => t.id === id) as ConvertibleLoanTransaction)
          .filter(Boolean);

        return (
          <TransactionCard title={`${translations.financingRound}: ${roundTx.roundName}`} date={roundTx.date} key={tx.id} actions={actionButtons} locale={locale}>
            <DetailItem label={translations.preMoneyValuation} value={roundTx.preMoneyValuation} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            <DetailItem label={translations.totalInvestment} value={totalInvestment} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            <DetailItem label={translations.postMoneyValuation} value={postMoneyValuation} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            
            <div className="pt-2">
                <p className="font-semibold mb-1 text-secondary">{translations.newShareClassDetails}:</p>
                <ShareClassDetails shareClass={roundTx.newShareClass} translations={translations} />
            </div>

            <div className="pt-2">
                <p className="font-semibold mt-2 text-secondary">{translations.investors}:</p>
                <ul className="space-y-1 text-secondary">
                {roundTx.newShareholdings.map(s => (
                    <li key={s.id} className="flex justify-between items-baseline p-1 bg-background-subtle rounded-md">
                        <span className="text-primary">{s.stakeholderName}: {(s.investment || 0).toLocaleString(locale, {style:'currency', currency: projectCurrency})}</span>
                        <span className="text-secondary text-xs font-mono">{s.shares.toLocaleString(locale)} {translations.shares}</span>
                    </li>
                ))}
                </ul>
            </div>
            
            {convertedLoans.length > 0 && (
                 <div className="pt-2">
                    <p className="font-semibold mt-2 text-secondary">{translations.convertedLoans}:</p>
                    <ul className="list-disc pl-5 text-secondary">
                        {convertedLoans.map(loan => (
                            <li key={loan.id} className="text-primary">{loan.investorName} - {loan.amount.toLocaleString(locale, {style:'currency', currency: projectCurrency})}</li>
                        ))}
                    </ul>
                </div>
            )}

            {metaInfo}
          </TransactionCard>
        );
      }
      case TransactionType.SHARE_TRANSFER: {
        const transferTx = tx as ShareTransferTransaction;
        const seller = stakeholders.find(s => s.id === transferTx.sellerStakeholderId);
        const shareClass = allShareClassesAsOfNow.get(transferTx.shareClassId);
        
        return (
            <TransactionCard title={translations.shareTransfer} date={transferTx.date} key={tx.id} actions={actionButtons} locale={locale}>
                <DetailItem label={translations.seller} value={seller?.name || 'N/A'} />
                <DetailItem label={translations.buyer} value={transferTx.buyerStakeholderName} />
                <DetailItem label={translations.shares} value={`${transferTx.numberOfShares.toLocaleString(locale)} ${shareClass?.name || ''}`} />
                <DetailItem label={translations.pricePerShare} value={transferTx.pricePerShare} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
                <DetailItem label={translations.totalInvestment} value={transferTx.numberOfShares * transferTx.pricePerShare} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
                {transferTx.additionalPayment && (
                    <DetailItem label={transferTx.additionalPayment.description || translations.additionalPayment} value={transferTx.additionalPayment.amount} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
                )}
                {metaInfo}
            </TransactionCard>
        );
      }
      case TransactionType.EQUALIZATION_PURCHASE: {
        const eqTx = tx as EqualizationPurchaseTransaction;
        const shareClass = allShareClassesAsOfNow.get(eqTx.shareClassId);
        const referenceTx = transactions.find(t => t.id === eqTx.referenceTransactionId);
        let referenceTxName = 'N/A';
        if (referenceTx) {
            if (referenceTx.type === TransactionType.FOUNDING) {
                referenceTxName = `${translations.founding}: ${(referenceTx as FoundingTransaction).companyName}`;
            } else if (referenceTx.type === TransactionType.FINANCING_ROUND) {
                referenceTxName = `${translations.financingRound}: ${(referenceTx as FinancingRoundTransaction).roundName}`;
            }
        }

        return (
            <TransactionCard title={translations.equalizationPurchase} date={eqTx.date} key={tx.id} actions={actionButtons} locale={locale}>
                <DetailItem label={translations.newStakeholderName} value={eqTx.newStakeholderName} />
                <DetailItem label={translations.purchasedShares} value={`${eqTx.purchasedShares.toLocaleString(locale)} ${shareClass?.name || ''}`} />
                <DetailItem label={translations.pricePerShare} value={eqTx.pricePerShare} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
                <DetailItem label={translations.investmentAmount} value={eqTx.purchasedShares * eqTx.pricePerShare} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
                <DetailItem label={translations.equalizationInterestRate} value={`${(eqTx.equalizationInterestRate * 100).toFixed(2)}%`} isNumeric />
                <DetailItem label={translations.referenceTransaction} value={referenceTxName} />
                {metaInfo}
            </TransactionCard>
        );
      }
      case TransactionType.DEBT_INSTRUMENT: {
        const debtTx = tx as DebtInstrumentTransaction;
        const seniorityTextMap: Record<DebtInstrumentTransaction['seniority'], string> = {
            'SENIOR_SECURED': translations.seniorSecured,
            'SENIOR_UNSECURED': translations.seniorUnsecured,
            'SUBORDINATED': translations.subordinated,
        };
        const seniorityText = seniorityTextMap[debtTx.seniority];
        
        return (
          <TransactionCard title={translations.debtInstrument} date={debtTx.date} key={tx.id} actions={actionButtons} locale={locale}>
            <DetailItem label={translations.lenderName} value={debtTx.lenderName} />
            <DetailItem label={translations.investmentAmount} value={debtTx.amount} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            <DetailItem label={translations.interestRate} value={`${(debtTx.interestRate * 100).toFixed(2)}%`} isNumeric />
            <DetailItem label={translations.seniority} value={seniorityText} />
            {metaInfo}
          </TransactionCard>
        );
      }
      case TransactionType.UPDATE_SHARE_CLASS: {
          const updateTx = tx as UpdateShareClassTransaction;
          const txsBeforeThisOne = transactions.filter(t => t.id !== tx.id);
          const shareClassesBeforeUpdate = getShareClassesAsOf(txsBeforeThisOne, tx.date);
          const oldShareClassState = shareClassesBeforeUpdate.get(updateTx.shareClassIdToUpdate);
          const newShareClassState = allShareClassesAsOfNow.get(updateTx.shareClassIdToUpdate);
          
          return (
            <TransactionCard title={translations.updateShareClass} date={updateTx.date} key={tx.id} actions={actionButtons} locale={locale}>
                <DetailItem label={translations.shareClassName} value={newShareClassState?.name || 'N/A'} />
                <p className="font-semibold mt-2 text-secondary">{translations.updatedProperties}:</p>
                <div className="space-y-1 pl-2">
                    {Object.entries(updateTx.updatedProperties).map(([key, value]) => {
                        const oldValue = oldShareClassState ? (oldShareClassState as any)[key] : 'N/A';
                        const tKey = (key === 'name' ? 'shareClassName' : key) as keyof Translations;
                        
                        const translationCandidate = translations[tKey];
                        const keyTranslation = typeof translationCandidate === 'string' ? translationCandidate : key;
                            
                        return (
                            <div key={key} className="text-sm">
                                <span className="font-medium text-primary">{keyTranslation}: </span>
                                <span className="text-danger font-mono">{oldValue?.toString() || 'N/A'}</span>
                                <span className="text-secondary mx-1">➔</span>
                                <span className="text-success font-mono">{value?.toString() || 'N/A'}</span>
                            </div>
                        );
                    })}
                </div>
                {metaInfo}
            </TransactionCard>
          );
      }
      default:
        return null;
    }
  };

  return <div className="space-y-4">{filteredTransactions.map(renderTransactionDetails)}</div>;
};

export default TransactionList;