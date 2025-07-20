import React from 'react';
import type { VotingResult, Language } from '../types';
import type { Translations } from '../i18n';
import ResultCardActions from './ResultCardActions';

interface VotingViewProps {
  result: VotingResult | null;
  translations: Translations;
  language: Language;
  onPrint: () => void;
  onExport: (format: 'png'|'pdf') => void;
  containerId: string;
}

function VotingView({ result, translations, language, onPrint, onExport, containerId }: VotingViewProps) {
  const locale = language === 'de' ? 'de-DE' : 'en-US';
  
  const content = result ? (
    <div className="space-y-4">
        <p className="text-sm text-theme-secondary">
            {translations.asOfDate}: {new Date(result.asOfDate).toLocaleDateString(locale)}
        </p>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-theme-subtle">
                <thead className="bg-theme-subtle">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">{translations.stakeholder}</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-theme-secondary uppercase tracking-wider">{translations.shareClass}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">{translations.votes}</th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-theme-secondary uppercase tracking-wider">{translations.percentage}</th>
                    </tr>
                </thead>
                <tbody className="bg-theme-surface divide-y divide-theme-subtle">
                    {result.voteDistribution.map((dist, index) => (
                    <tr key={`${dist.stakeholderName}-${dist.shareClassName}-${index}`} className="hover:bg-theme-subtle">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-theme-primary">{dist.stakeholderName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary">{dist.shareClassName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary text-right font-mono">{dist.votes.toLocaleString(locale)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-theme-secondary text-right font-mono">{dist.percentage.toFixed(4)}%</td>
                    </tr>
                    ))}
                </tbody>
                 <tfoot className="bg-theme-background">
                    <tr>
                        <td colSpan={2} className="px-6 py-3 text-left text-sm font-bold text-theme-primary">{translations.totalVotes}</td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-theme-primary font-mono">{result.totalVotes.toLocaleString(locale)}</td>
                        <td className="px-6 py-3 text-right text-sm font-bold text-theme-primary font-mono">100.0000%</td>
                    </tr>
                </tfoot>
            </table>
        </div>
    </div>
  ) : (
    <div className="text-center py-10">
      <p className="text-theme-secondary">{translations.noVoteYet}</p>
    </div>
  );

  return (
    <div id={containerId} className="bg-theme-surface p-4 sm:p-6 rounded-lg shadow-sm border border-theme-subtle">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-theme-primary">{translations.votingResultsTitle}</h3>
            <ResultCardActions onPrint={onPrint} onExport={onExport} translations={translations} />
        </div>
        {content}
    </div>
  );
};

export default VotingView;