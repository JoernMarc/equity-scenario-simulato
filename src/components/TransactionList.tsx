

import React, { useMemo } from 'react';
import type { Transaction, FoundingTransaction, ConvertibleLoanTransaction, FinancingRoundTransaction, ShareTransferTransaction, Language, ShareClass, DebtInstrumentTransaction, UpdateShareClassTransaction, Stakeholder, EqualizationPurchaseTransaction } from '../types';
import { TransactionType, TransactionStatus, ConversionMechanism } from '../types';
import type { Translations } from '../i18n';
import PencilIcon from '../styles/icons/PencilIcon';
import TrashIcon from '../styles/icons/TrashIcon';
import { getShareClassesAsOf } from '../logic/calculations';
import { snakeToCamel } from '../logic/utils';

interface TransactionListProps {
  transactions: Transaction[];
  allTransactions: Transaction[]; // For looking up converted loans
  stakeholders: Stakeholder[];
  translations: Translations;
  language: Language;
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  isFoundingDeletable: boolean;
  searchQuery: string;
  simulationDate: string;
  projectCurrency: string;
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
    <div className="bg-theme-surface p-4 rounded-lg shadow-sm border border-theme-subtle">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-theme-interactive pr-4">{title}</h4>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm text-theme-secondary">{new Date(date).toLocaleDateString(locale)}</span>
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
            <dt className="font-semibold text-theme-secondary col-span-1">{label}</dt>
            <dd className={`text-theme-primary col-span-2 ${isNumeric ? 'text-right font-mono' : ''}`}>
                 {displayValue} {unit && <span className="text-theme-secondary ml-1">{unit}</span>}
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
        <div className="p-3 bg-theme-background rounded-md border border-theme-subtle mt-2 space-y-2">
            <h5 className="font-bold text-theme-primary">{shareClass.name}</h5>
             <DetailItem label={translations.liquidationPreference} value={`${shareClass.liquidationPreferenceRank} / ${shareClass.liquidationPreferenceFactor}x / ${liqPrefType} ${shareClass.liquidationPreferenceType === 'CAPPED_PARTICIPATING' ? `(${shareClass.participationCapFactor}x Cap)` : ''}`} />
             <DetailItem label={translations.antiDilutionProtection} value={antiDilutionType} />
             <DetailItem label={translations.votesPerShare} value={shareClass.votesPerShare} />
        </div>
    );
};


function TransactionList({ transactions, allTransactions, stakeholders, translations, language, onEdit, onDelete, isFoundingDeletable, searchQuery, simulationDate, projectCurrency }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-theme-surface rounded-lg shadow-sm border border-theme-subtle">
        <p className="text-theme-secondary">{searchQuery ? translations.noSearchResults : translations.noTransactions}</p>
      </div>
    );
  }

  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  const allShareClassesAsOfNow = useMemo(() => {
    return getShareClassesAsOf(allTransactions, new Date().toISOString().split('T')[0]);
  }, [allTransactions]);

  const renderTransactionDetails = (tx: Transaction) => {
    const isFounding = tx.type === TransactionType.FOUNDING;
    const canDeleteFounding = isFounding && isFoundingDeletable;

    const actionButtons = (
      <div className="flex items-center gap-1 border-l border-theme-subtle ml-2 pl-2">
        <button 
            onClick={() => onEdit(tx)} 
            className="p-1 text-theme-secondary hover:text-theme-interactive hover:bg-theme-subtle rounded-md"
            aria-label={translations.edit}
            title={translations.edit}
        >
          <PencilIcon className="w-4 h-4" />
        </button>
        <button 
            onClick={() => onDelete(tx.id)} 
            disabled={isFounding && !canDeleteFounding}
            className="p-1 text-theme-secondary hover:text-theme-danger hover:bg-theme-subtle rounded-md disabled:opacity-30 disabled:cursor-not-allowed"
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
      [TransactionStatus.DRAFT]: 'bg-theme-subtle text-theme-secondary',
      [TransactionStatus.ACTIVE]: 'bg-theme-success-subtle-bg text-theme-success-subtle-text',
      [TransactionStatus.ARCHIVED]: 'bg-theme-danger-subtle-bg text-theme-danger-subtle-text',
    }[tx.status];

    const metaInfo = (
        <div className="mt-3 pt-3 border-t border-theme-subtle flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-theme-secondary">
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
                <input type="checkbox" checked={isUsed} readOnly className="h-4 w-4 rounded border-theme-strong accent-theme-interactive" id={`used-checkbox-${tx.id}`} />
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
            <p className="font-semibold mt-2 text-theme-secondary">{translations.shareholdings}:</p>
            <ul className="space-y-1 text-theme-secondary">
              {foundingTx.shareholdings.map(sh => {
                const pricePerShare = (sh.investment ?? 0) > 0 && sh.shares > 0 ? (sh.investment ?? 0) / sh.shares : 0;
                return (
                 <li key={sh.id} className="flex justify-between items-baseline p-1 bg-theme-subtle rounded-md">
                    <span className="text-theme-primary">
                      {sh.stakeholderName}: {sh.shares.toLocaleString(locale)} {shareClassMap.get(sh.shareClassId) || 'N/A'}
                      {(sh.investment ?? 0) > 0 && ` (${(sh.investment ?? 0).toLocaleString(locale, {style:'currency', currency: projectCurrency})})`}
                    </span>
                    {pricePerShare > 0 && 
                      <span className="text-theme-secondary text-xs font-mono">
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
            
            <div className="mt-2 pt-2 border-t border-theme-subtle">
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
          .map(id => allTransactions.find(t => t.id === id) as ConvertibleLoanTransaction)
          .filter(Boolean);

        return (
          <TransactionCard title={`${translations.financingRound}: ${roundTx.roundName}`} date={roundTx.date} key={tx.id} actions={actionButtons} locale={locale}>
            <DetailItem label={translations.preMoneyValuation} value={roundTx.preMoneyValuation} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            <DetailItem label={translations.totalInvestment} value={totalInvestment} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            <DetailItem label={translations.postMoneyValuation} value={postMoneyValuation} isNumeric isCurrency locale={locale} projectCurrency={projectCurrency}/>
            
            <div className="pt-2">
                <p className="font-semibold mb-1 text-theme-secondary">{translations.newShareClassDetails}:</p>
                <ShareClassDetails shareClass={roundTx.newShareClass} translations={translations} />
            </div>

            <div className="pt-2">
                <p className="font-semibold mt-2 text-theme-secondary">{translations.investors}:</p>
                <ul className="space-y-1 text-theme-secondary">
                {roundTx.newShareholdings.map(s => (
                    <li key={s.id} className="flex justify-between items-baseline p-1 bg-theme-subtle rounded-md">
                        <span className="text-theme-primary">{s.stakeholderName}: {(s.investment || 0).toLocaleString(locale, {style:'currency', currency: projectCurrency})}</span>
                        <span className="text-theme-secondary text-xs font-mono">{s.shares.toLocaleString(locale)} {translations.shares}</span>
                    </li>
                ))}
                </ul>
            </div>
            
            {convertedLoans.length > 0 && (
                 <div className="pt-2">
                    <p className="font-semibold mt-2 text-theme-secondary">{translations.convertedLoans}:</p>
                    <ul className="list-disc pl-5 text-theme-secondary">
                        {convertedLoans.map(loan => (
                            <li key={loan.id} className="text-theme-primary">{loan.investorName} - {loan.amount.toLocaleString(locale, {style:'currency', currency: projectCurrency})}</li>
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
        const referenceTx = allTransactions.find(t => t.id === eqTx.referenceTransactionId);
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
          const txsBeforeThisOne = allTransactions.filter(t => t.id !== tx.id);
          const shareClassesBeforeUpdate = getShareClassesAsOf(txsBeforeThisOne, tx.date);
          const oldShareClassState = shareClassesBeforeUpdate.get(updateTx.shareClassIdToUpdate);
          const newShareClassState = allShareClassesAsOfNow.get(updateTx.shareClassIdToUpdate);
          
          return (
            <TransactionCard title={translations.updateShareClass} date={updateTx.date} key={tx.id} actions={actionButtons} locale={locale}>
                <DetailItem label={translations.shareClassName} value={newShareClassState?.name || 'N/A'} />
                <p className="font-semibold mt-2 text-theme-secondary">{translations.updatedProperties}:</p>
                <div className="space-y-1 pl-2">
                    {Object.entries(updateTx.updatedProperties).map(([key, value]) => {
                        const oldValue = oldShareClassState ? (oldShareClassState as any)[key] : 'N/A';
                        const keyTranslation = (translations[snakeToCamel(key) as keyof Translations] as string) || key;
                        return (
                            <div key={key} className="text-sm">
                                <span className="font-medium text-theme-primary">{keyTranslation}: </span>
                                <span className="text-theme-danger font-mono">{oldValue?.toString() || 'N/A'}</span>
                                <span className="text-theme-secondary mx-1">➔</span>
                                <span className="text-theme-success font-mono">{value?.toString() || 'N/A'}</span>
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

  return <div className="space-y-4">{transactions.map(renderTransactionDetails)}</div>;
};

export default TransactionList;