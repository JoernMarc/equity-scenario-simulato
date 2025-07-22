
import type { ProjectAssessmentResult, AssessmentFinding } from '../types';
import ResultCardActions from './ResultCardActions';
import { useLocalization } from '../contexts/LocalizationContext';
import SparklesIcon from '../styles/icons/SparklesIcon';

interface ProjectAssessmentViewProps {
  assessment: ProjectAssessmentResult | null;
  onAnalyze: () => void;
  onPrint: () => void;
  onExport: (format: 'png' | 'pdf') => void;
  containerId: string;
}

const FindingIcon = ({ severity }: { severity: AssessmentFinding['severity'] }) => {
  switch (severity) {
    case 'danger':
      return <span className="text-2xl text-danger-subtle-text" aria-hidden="true">❗</span>;
    case 'warning':
      return <span className="text-2xl text-warning-subtle-text" aria-hidden="true">⚠️</span>;
    case 'info':
      return <span className="text-2xl text-info-subtle-text" aria-hidden="true">ℹ️</span>;
    default:
      return null;
  }
};

function ProjectAssessmentView({ assessment, onAnalyze, onPrint, onExport, containerId }: ProjectAssessmentViewProps) {
  const { t: translations, locale } = useLocalization();

  const severityBgClass: Record<AssessmentFinding['severity'], string> = {
    danger: 'bg-danger-subtle-bg border-danger-subtle-text/30',
    warning: 'bg-warning-subtle-bg border-warning-subtle-text/30',
    info: 'bg-info-subtle-bg border-info-subtle-text/30',
  };

  const severityTextClass: Record<AssessmentFinding['severity'], string> = {
    danger: 'text-danger-subtle-text',
    warning: 'text-warning-subtle-text',
    info: 'text-info-subtle-text',
  };

  const content = assessment ? (
    <div className="space-y-4">
      <p className="text-sm text-secondary">
        {translations.asOfDate}: {new Date(assessment.asOfDate).toLocaleDateString(locale)}
      </p>
      {assessment.findings.length > 0 ? (
        <div className="space-y-3">
          {assessment.findings.map((finding, index) => (
            <div key={index} className={`p-4 rounded-md border ${severityBgClass[finding.severity]}`}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <FindingIcon severity={finding.severity} />
                </div>
                <div>
                  <h4 className={`font-bold ${severityTextClass[finding.severity]}`}>{finding.title}</h4>
                  <p className="text-sm text-secondary mt-1">{finding.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-6">
          <p className="text-secondary">{translations.projectAssessment.noFindings}</p>
        </div>
      )}
    </div>
  ) : (
    <div className="text-center py-6">
      <button
        onClick={onAnalyze}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-interactive"
      >
        <SparklesIcon className="w-5 h-5" />
        {translations.projectAssessment.analyzeProject}
      </button>
    </div>
  );

  return (
    <div id={containerId} className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-primary">{translations.projectAssessment.title}</h3>
        {assessment && <ResultCardActions onPrint={onPrint} onExport={onExport} />}
      </div>
      {content}
    </div>
  );
}

export default ProjectAssessmentView;
