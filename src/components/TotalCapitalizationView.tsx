

import type { TotalCapitalizationResult } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';

interface TotalCapitalizationViewProps {
  result: TotalCapitalizationResult | null;
  containerId: string;
  onPrint: () => void;
  onExport: (format: 'png'|'pdf') => void;
  projectCurrency: string;
}

function TotalCapitalizationView({ result, containerId, onPrint, onExport, projectCurrency }: TotalCapitalizationViewProps) {
  const { t: translations, locale } = useLocalization();
  
  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale, { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  if (!result || result.entries.length === 0) {
    return null; // Don't render anything if there's no data
  }

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">{translations.totalCapitalizationTitle.replace('{currency}', projectCurrency)}</h3>
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
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.value.replace('{currency}', projectCurrency)}</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-subtle">
            {result.entries.map((entry) => (
              <tr key={entry.key} className="hover:bg-background-subtle">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{entry.stakeholderName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{entry.instrumentName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{entry.instrumentType}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{entry.amountOrShares}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(entry.value)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-background">
            <tr>
                <td colSpan={4} className="px-6 py-3 text-left text-sm font-bold text-primary">Total</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.totalValue)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default TotalCapitalizationView;