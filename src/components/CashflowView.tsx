
import type { CashflowResult } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';

interface CashflowViewProps {
  result: CashflowResult | null;
  containerId: string;
  onPrint: () => void;
  onExport: (format: 'png' | 'pdf') => void;
}

function CashflowView({ result, containerId, onPrint, onExport }: CashflowViewProps) {
  const { t, locale } = useLocalization();

  const formatCurrency = (amount: number) => {
    if (!result?.currency) return String(amount);
    return amount.toLocaleString(locale, { style: 'currency', currency: result.currency, minimumFractionDigits: 0, maximumFractionDigits: 0 });
  }

  if (!result || result.entries.length === 0) {
    return null; // Don't render if no cash transactions
  }

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">{t.cashflowViewTitle}</h3>
        <ResultCardActions onPrint={onPrint} onExport={onExport} />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-subtle">
          <thead className="bg-background-subtle">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t.date}</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{t.description}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t.cashIn}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t.cashOut}</th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{t.balance}</th>
            </tr>
          </thead>
          <tbody className="bg-surface divide-y divide-subtle">
            {result.entries.map((entry) => (
              <tr key={entry.key} className="hover:bg-background-subtle">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{new Date(entry.date).toLocaleDateString(locale)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary">{entry.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-success-subtle-text text-right font-mono">{entry.cashIn > 0 ? formatCurrency(entry.cashIn) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-danger-subtle-text text-right font-mono">{entry.cashOut > 0 ? formatCurrency(entry.cashOut) : '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-primary text-right font-mono font-bold">{formatCurrency(entry.balance)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-background">
            <tr>
                <td colSpan={4} className="px-6 py-3 text-left text-sm font-bold text-primary">{t.finalBalance}</td>
                <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.finalBalance)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default CashflowView;
