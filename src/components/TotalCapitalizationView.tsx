

import { useState, Fragment } from 'react';
import type { TotalCapitalizationResult } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';
import ChevronRightIcon from '../styles/icons/ChevronRightIcon';

interface TotalCapitalizationViewProps {
  result: TotalCapitalizationResult | null;
  containerId: string;
  onPrint: () => void;
  onExport: (format: 'png'|'pdf') => void;
}

function TotalCapitalizationView({ result, containerId, onPrint, onExport }: TotalCapitalizationViewProps) {
  const { t: translations, locale } = useLocalization();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  const toggleRow = (key: string) => {
    setExpandedRows(prev => {
      const newSet = new Set(prev);
      if (newSet.has(key)) {
        newSet.delete(key);
      } else {
        newSet.add(key);
      }
      return newSet;
    });
  };
  
  const instrumentTypeTranslations = {
    Equity: translations.equity,
    Hybrid: translations.hybrid,
    Debt: translations.debt,
  };

  const formatCurrency = (amount: number) => {
    if (!result?.currency) return amount.toLocaleString(locale);
    return amount.toLocaleString(locale, { style: 'currency', currency: result.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  if (!result || result.entries.length === 0) {
    return null; // Don't render anything if there's no data
  }

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">{translations.totalCapitalizationTitle}</h3>
        <ResultCardActions onPrint={onPrint} onExport={onExport} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle">
          <thead className="bg-background-subtle">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.stakeholder}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.instrument}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.instrumentType}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.amountOrShares}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.value}</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-subtle">
            {result.entries.map((entry) => (
              <Fragment key={entry.key}>
                <tr className="hover:bg-background-subtle">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">
                    <div className="flex items-center gap-1">
                      {entry.valueBreakdown && (
                        <button 
                          onClick={() => toggleRow(entry.key)} 
                          className="p-1 rounded-full hover:bg-background-subtle"
                          aria-expanded={expandedRows.has(entry.key)}
                          aria-label={expandedRows.has(entry.key) ? translations.collapse : translations.expand}
                        >
                          <ChevronRightIcon className={`w-4 h-4 text-secondary transition-transform ${expandedRows.has(entry.key) ? 'rotate-90' : ''}`} />
                        </button>
                      )}
                      <span className={!entry.valueBreakdown ? 'ml-6' : ''}>{entry.stakeholderName}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{entry.instrumentName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{instrumentTypeTranslations[entry.instrumentType]}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{entry.amountOrShares}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(entry.value)}</td>
                </tr>
                {expandedRows.has(entry.key) && entry.valueBreakdown && (
                  <tr className="bg-background-subtle">
                    <td colSpan={5} className="px-6 py-3">
                      <div className="pl-12 pr-4 space-y-1">
                        <div className="flex justify-between text-sm items-baseline">
                          <span className="text-secondary">{translations.principalAmount}:</span>
                          <span className="font-mono text-primary">{formatCurrency(entry.valueBreakdown.principal)}</span>
                        </div>
                        <div className="flex justify-between text-sm items-baseline">
                          <span className="text-secondary">{translations.accruedInterest}:</span>
                          <span className="font-mono text-primary">{formatCurrency(entry.valueBreakdown.interest)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
          <tfoot className="bg-background">
            <tr>
                <td colSpan={4} className="px-6 py-3 text-left text-sm font-bold text-primary">Total ({result.currency})</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TotalCapitalizationView;
