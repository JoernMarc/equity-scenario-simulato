
import React from 'react';
import type { CapTable } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';

interface CapTableViewProps {
  capTable: CapTable | null;
  onPrint: () => void;
  onExport: (format: 'png'|'pdf') => void;
  containerId: string;
}

function CapTableView({ capTable, onPrint, onExport, containerId }: CapTableViewProps) {
  const { t: translations, locale } = useLocalization();

  const content = capTable && capTable.entries.length > 0 ? (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle">
          <thead className="bg-background-subtle">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.stakeholder}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.shareClass}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.vestedShares}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.unvestedShares}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.shares}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.percentage}</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-subtle">
            {capTable.entries.map((entry, index) => {
              const unvestedShares = entry.shares - entry.vestedShares;
              return (
                <tr key={`${entry.stakeholderId}-${entry.shareClassId}-${index}`} className="hover:bg-background-subtle">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{entry.stakeholderName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{entry.shareClassName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-success-subtle-text text-right font-mono">{entry.vestedShares.toLocaleString(locale)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{unvestedShares.toLocaleString(locale)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-primary text-right font-mono font-bold">{entry.shares.toLocaleString(locale)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{entry.percentage.toFixed(4)}%</td>
                </tr>
              )
            })}
          </tbody>
          <tfoot className="bg-background">
            <tr>
                <td colSpan={2} className="px-6 py-3 text-left text-sm font-bold text-primary">{translations.totalIssuedShares}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-success-subtle-text font-mono">{capTable.totalVestedShares.toLocaleString(locale)}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-secondary font-mono">{(capTable.totalShares - capTable.totalVestedShares).toLocaleString(locale)}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">{capTable.totalShares.toLocaleString(locale)}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">100.0000%</td>
            </tr>
          </tfoot>
        </table>
      </div>
  ) : (
    <div className="text-center py-10">
      <p className="text-secondary">
        {capTable === null ? translations.resultsPlaceholder : translations.noTransactions}
      </p>
    </div>
  );


  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-center mb-4">
        <div>
            <h3 className="text-lg font-semibold text-primary">{translations.capTableTitle}</h3>
            {capTable && 
              <p className="text-sm text-secondary">
                  {translations.asOfDate}: {new Date(capTable.asOfDate).toLocaleDateString(locale)}
              </p>
            }
        </div>
        <ResultCardActions onPrint={onPrint} onExport={onExport} />
      </div>
      {content}
    </div>
  );
};

export default CapTableView;
