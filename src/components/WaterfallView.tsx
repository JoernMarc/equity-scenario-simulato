

import { useState } from 'react';
import type { WaterfallResult } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';
import { useProject } from '../contexts/ProjectContext';

interface WaterfallViewProps {
  result: WaterfallResult | null;
  onPrint: () => void;
  onExport: (format: 'png'|'pdf') => void;
  containerId: string;
}

function WaterfallView({ result, onPrint, onExport, containerId }: WaterfallViewProps) {
  const { t: translations, locale } = useLocalization();
  const { projectCurrency } = useProject();
  const [isLogVisible, setIsLogVisible] = useState(false);

  const formatCurrency = (amount: number, withSymbol: boolean = false) => {
    return amount.toLocaleString(locale, { 
        style: withSymbol ? 'currency' : 'decimal', 
        currency: projectCurrency, 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
    });
  }
  
  const content = result ? (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-center">
            <div className="bg-background-subtle p-3 rounded-lg">
                <div className="text-sm font-medium text-secondary">{translations.netExitProceeds}</div>
                <div className="text-xl font-bold text-primary">{formatCurrency(result.netExitProceeds, true)}</div>
            </div>
            <div className="bg-background-subtle p-3 rounded-lg">
                <div className="text-sm font-medium text-secondary">{translations.remainingValue}</div>
                <div className={`text-xl font-bold ${Math.abs(result.remainingValue) > 1 ? 'text-danger' : 'text-primary'}`}>{formatCurrency(result.remainingValue, true)}</div>
            </div>
        </div>

        <div className="overflow-x-auto pt-4">
            <table className="min-w-full divide-y divide-subtle">
                <thead className="bg-background-subtle">
                    <tr>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.stakeholder}</th>
                        <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.shareClass}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.initialInvestment}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.fromDebtRepayment}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.fromLiquidationPreference}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.fromParticipation}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.fromConvertedShares}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs text-secondary uppercase tracking-wider font-bold">{translations.totalProceeds}</th>
                        <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.multiple}</th>
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-subtle">
                    {result.distributions.map((dist, index) => (
                    <tr key={`${dist.stakeholderId}-${dist.shareClassId}-${index}`} className="hover:bg-background-subtle">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-primary">{dist.stakeholderName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary">{dist.shareClassName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(dist.initialInvestment)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(dist.fromDebtRepayment || 0)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(dist.fromLiquidationPreference)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(dist.fromParticipation)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary text-right font-mono">{formatCurrency(dist.fromConvertedShares)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-primary text-right font-mono font-bold">{formatCurrency(dist.totalProceeds)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-secondary text-right font-mono">{dist.multiple.toFixed(2)}x</td>
                    </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-background">
                    <tr>
                        <td colSpan={2} className="px-4 py-3 text-left text-sm font-bold text-primary">Total</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.distributions.reduce((sum, d) => sum + d.initialInvestment, 0))}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.distributions.reduce((sum, d) => sum + (d.fromDebtRepayment || 0), 0))}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.distributions.reduce((sum, d) => sum + d.fromLiquidationPreference, 0))}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.distributions.reduce((sum, d) => sum + d.fromParticipation, 0))}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.distributions.reduce((sum, d) => sum + d.fromConvertedShares, 0))}</td>
                        <td className="px-4 py-3 text-right text-sm font-bold text-primary font-mono">{formatCurrency(result.distributions.reduce((sum, d) => sum + d.totalProceeds, 0))}</td>
                        <td className="px-4 py-3"></td>
                    </tr>
                </tfoot>
            </table>
        </div>

        {result.calculationLog && result.calculationLog.length > 0 && (
          <div className="pt-4 text-center">
            <button
              onClick={() => setIsLogVisible(!isLogVisible)}
              className="px-4 py-2 text-sm font-medium text-interactive bg-interactive/10 rounded-md hover:bg-interactive/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interactive"
            >
              {isLogVisible ? translations.hideCalculationSteps : translations.showCalculationSteps}
            </button>
            {isLogVisible && (
               <div className="mt-4 p-4 bg-slate-800 text-slate-100 rounded-lg font-mono text-left text-xs overflow-x-auto">
                 <h4 className="text-base text-white font-sans font-bold mb-3">{translations.calculationSteps}</h4>
                 <ol className="list-decimal list-inside space-y-1.5">
                   {result.calculationLog.map((log, index) => <li key={index}><span className="text-slate-300">{log}</span></li>)}
                 </ol>
               </div>
            )}
          </div>
        )}
    </div>
  ) : (
     <div className="text-center py-10">
        <p className="text-secondary">{translations.noWaterfallYet}</p>
      </div>
  );

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary">{translations.waterfallResultsTitle}</h3>
            <ResultCardActions onPrint={onPrint} onExport={onExport} />
        </div>
        {content}
    </div>
  );
};

export default WaterfallView;