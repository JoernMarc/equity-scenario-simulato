

import type { VotingResult } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';

interface VotingViewProps {
  result: VotingResult | null;
  onPrint: () => void;
  onExport: (format: 'png'|'pdf') => void;
  containerId: string;
  lastRun: string | null;
}

function VotingView({ result, onPrint, onExport, containerId, lastRun }: VotingViewProps) {
  const { t: translations, locale } = useLocalization();
  
  const content = result ? (
    <div className="space-y-4">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-subtle">
                <thead className="bg-background-subtle">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.stakeholder}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">{translations.shareClass}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.votes}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">{translations.percentage}</th>
                    </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-subtle">
                    {result.voteDistribution.map((dist, index) => (
                    <tr key={`${dist.stakeholderName}-${dist.shareClassName}-${index}`} className="hover:bg-background-subtle">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{dist.stakeholderName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">{dist.shareClassName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{dist.votes.toLocaleString(locale)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-right font-mono">{dist.percentage.toFixed(4)}%</td>
                    </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-background">
                    <tr>
                        <td colSpan={2} className="px-6 py-3 text-left text-sm font-bold text-primary">{translations.totalVotes}</td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">{result.totalVotes.toLocaleString(locale)}</td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-primary font-mono">100.0000%</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  ) : (
    <div className="text-center py-10">
      <p className="text-secondary">{translations.noVoteYet}</p>
    </div>
  );

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
        <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-lg font-semibold text-primary">{translations.votingResultsTitle}</h3>
                {lastRun && 
                    <p className="text-sm text-secondary">
                        {translations.lastRun}: {lastRun}
                    </p>
                }
            </div>
            <ResultCardActions onPrint={onPrint} onExport={onExport} />
        </div>
        {content}
    </div>
  );
};

export default VotingView;