
import type { StakeholderPayoutSummaryResult } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';
import { useProject } from '../contexts/ProjectContext';

interface StakeholderPayoutSummaryViewProps {
  result: StakeholderPayoutSummaryResult | null;
  containerId: string;
  onPrint: () => void;
  onExport: (format: 'png' | 'pdf') => void;
}

function StakeholderPayoutSummaryView({ result, containerId, onPrint, onExport }: StakeholderPayoutSummaryViewProps) {
  const { t, locale } = useLocalization();
  const { projectCurrency } = useProject();

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString(locale, { style: 'currency', currency: projectCurrency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  if (!result || result.entries.length === 0) {
    return null;
  }

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">{t.stakeholderPayoutSummaryTitle}</h3>
        <ResultCardActions onPrint={onPrint} onExport={onExport} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle">
          <thead className="bg-background-subtle">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t.stakeholder}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t.totalPayout}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t.multipleOnInvestment}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t.percentageOfTotal}</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-subtle">
            {result.entries.map((entry) => (
              <tr key={entry.stakeholderId} className="hover:bg-background-subtle">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{entry.stakeholderName}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary text-right font-mono font-bold">{formatCurrency(entry.totalPayout)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{entry.multipleOnInvestment.toFixed(2)}x</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{entry.percentageOfTotal.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StakeholderPayoutSummaryView;
