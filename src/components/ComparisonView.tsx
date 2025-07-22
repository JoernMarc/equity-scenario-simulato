

import React, { useState, useMemo, useEffect } from 'react';
import type { Project, CapTable, WaterfallResult, VotingResult, TotalCapitalizationResult, CashflowResult, ProjectAssessmentResult, StakeholderPayoutSummaryResult } from '../types';
import { calculateCapTable, simulateWaterfall, simulateVote, calculateTotalCapitalization, calculateCashflow, assessProject, summarizeWaterfallByStakeholder } from '../logic/calculations';
import { useLocalization } from '../contexts/LocalizationContext';
import HelpTooltip from './HelpTooltip';
import CapTableView from './CapTableView';
import WaterfallView from './WaterfallView';
import VotingView from './VotingView';
import TotalCapitalizationView from './TotalCapitalizationView';
import CashflowView from './CashflowView';
import ProjectAssessmentView from './ProjectAssessmentView';
import PrintIcon from '../styles/icons/PrintIcon';
import { ProjectProvider } from '../contexts/ProjectContext';
import StakeholderPayoutSummaryView from './StakeholderPayoutSummaryView';


interface ComparisonViewProps {
  projectIds: [string, string];
  allProjects: Project[];
  onStopComparison: () => void;
  onChangeProject: (index: 0 | 1, newProjectId: string) => void;
  onPrint: () => void;
}

function ComparisonView({ projectIds, allProjects, onStopComparison, onChangeProject, onPrint }: ComparisonViewProps) {
  const { t, language, locale } = useLocalization();

  const [simulationDate, setSimulationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [exitProceeds, setExitProceeds] = useState<number | ''>('');
  const [transactionCosts, setTransactionCosts] = useState<number | ''>(0);
  const [lastRun, setLastRun] = useState<string | null>(null);
  
  const projectA = useMemo(() => allProjects.find(p => p.id === projectIds[0]), [allProjects, projectIds]);
  const projectB = useMemo(() => allProjects.find(p => p.id === projectIds[1]), [allProjects, projectIds]);

  const resultsA = useMemo(() => {
    if (!projectA) return null;
    const capTable = calculateCapTable(projectA.transactions, simulationDate);
    const assessment = assessProject(projectA.transactions, capTable, t);
    const voting = simulateVote(capTable, projectA.transactions);
    const totalCap = calculateTotalCapitalization(projectA.transactions, capTable, simulationDate, t, locale, projectA.currency);
    const cashflow = calculateCashflow(projectA.transactions, simulationDate, t, projectA.currency);
    const waterfall = (exitProceeds !== '') ? simulateWaterfall(capTable, projectA.transactions, exitProceeds, transactionCosts || 0, language) : null;
    const payoutSummary = waterfall ? summarizeWaterfallByStakeholder(waterfall) : null;
    return { capTable, assessment, voting, totalCap, cashflow, waterfall, payoutSummary };
  }, [projectA, simulationDate, exitProceeds, transactionCosts, t, locale, language]);

  const resultsB = useMemo(() => {
    if (!projectB) return null;
    const capTable = calculateCapTable(projectB.transactions, simulationDate);
    const assessment = assessProject(projectB.transactions, capTable, t);
    const voting = simulateVote(capTable, projectB.transactions);
    const totalCap = calculateTotalCapitalization(projectB.transactions, capTable, simulationDate, t, locale, projectB.currency);
    const cashflow = calculateCashflow(projectB.transactions, simulationDate, t, projectB.currency);
    const waterfall = (exitProceeds !== '') ? simulateWaterfall(capTable, projectB.transactions, exitProceeds, transactionCosts || 0, language) : null;
    const payoutSummary = waterfall ? summarizeWaterfallByStakeholder(waterfall) : null;
    return { capTable, assessment, voting, totalCap, cashflow, waterfall, payoutSummary };
  }, [projectB, simulationDate, exitProceeds, transactionCosts, t, locale, language]);

  useEffect(() => {
    if (resultsA?.capTable || resultsB?.capTable) {
        setLastRun(new Date().toLocaleString(locale));
    } else {
        setLastRun(null);
    }
  }, [resultsA, resultsB, locale]);

  const handleProjectSelect = (index: 0 | 1, newId: string) => {
      const otherIndex = index === 0 ? 1 : 0;
      if (projectIds[otherIndex] === newId) {
          // Avoid selecting the same project twice
          return;
      }
      onChangeProject(index, newId);
  }

  return (
    <main id="comparison-view-container" className="max-w-screen-2xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
      <div id="comparison-controls" className="flex justify-between items-center flex-wrap gap-4 no-print">
        <h2 className="text-2xl font-bold text-primary">{t.comparisonViewTitle}</h2>
        <button onClick={onStopComparison} className="text-sm text-interactive hover:underline">{t.backToDashboard}</button>
      </div>

      {/* Control Panel */}
      <div id="comparison-simulation-controls" className="bg-surface p-4 rounded-lg shadow-sm border border-subtle no-print">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            {/* Project Selectors */}
            <div className="flex gap-4">
                <div>
                    <label htmlFor="projectA" className="block text-sm font-medium text-secondary">{t.projectA}</label>
                    <select
                        id="projectA"
                        value={projectIds[0]}
                        onChange={(e) => handleProjectSelect(0, e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md"
                    >
                        {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="projectB" className="block text-sm font-medium text-secondary">{t.projectB}</label>
                    <select
                        id="projectB"
                        value={projectIds[1]}
                        onChange={(e) => handleProjectSelect(1, e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md"
                    >
                        {allProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                </div>
            </div>

            {/* Simulation Date */}
            <div className="flex items-center gap-2 justify-center">
                <label htmlFor="simulationDate" className="block text-sm font-medium text-secondary whitespace-nowrap">{t.simulationDateLabel}</label>
                <input
                    type="date"
                    id="simulationDate"
                    value={simulationDate}
                    onChange={(e) => setSimulationDate(e.target.value)}
                    className="px-3 py-1 bg-surface border border-strong rounded-md shadow-sm"
                />
            </div>
            
            {/* Waterfall Inputs */}
            <div className="flex items-end gap-4 justify-end">
                <div>
                    <label htmlFor="exitProceeds" className="flex items-center text-xs font-medium text-secondary">
                        {t.exitProceeds} <HelpTooltip text={t.help.exitProceeds} />
                    </label>
                    <input type="number" id="exitProceeds" value={exitProceeds} onChange={e => setExitProceeds(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md text-right" />
                </div>
                <div>
                    <label htmlFor="transactionCosts" className="flex items-center text-xs font-medium text-secondary">
                        {t.transactionCosts} <HelpTooltip text={t.help.transactionCosts} />
                    </label>
                    <input type="number" id="transactionCosts" value={transactionCosts} onChange={e => setTransactionCosts(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md text-right" />
                </div>
                <button onClick={onPrint} className="p-2 rounded-md transition-colors text-secondary hover:bg-background-subtle" title={t.printComparison}>
                    <PrintIcon className="w-5 h-5" />
                </button>
            </div>
         </div>
      </div>
      
      {/* Comparison Grid */}
      <div className="comparison-view-grid grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Column A */}
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-center text-interactive">{projectA?.name} ({projectA?.currency})</h3>
            {resultsA && projectA && (
                <ProjectProvider project={projectA}>
                    <ProjectAssessmentView assessment={resultsA.assessment} onAnalyze={() => {}} onPrint={()=>{}} onExport={()=>{}} containerId="assessment-a" />
                    <TotalCapitalizationView result={resultsA.totalCap} containerId="totalcap-a" onPrint={()=>{}} onExport={()=>{}} />
                    <CashflowView result={resultsA.cashflow} containerId="cashflow-a" onPrint={()=>{}} onExport={()=>{}} />
                    <CapTableView capTable={resultsA.capTable} lastRun={lastRun} containerId="captable-a" onPrint={()=>{}} onExport={()=>{}} />
                    <VotingView result={resultsA.voting} lastRun={lastRun} containerId="voting-a" onPrint={()=>{}} onExport={()=>{}} />
                    <WaterfallView result={resultsA.waterfall} containerId="waterfall-a" onPrint={()=>{}} onExport={()=>{}} />
                    <StakeholderPayoutSummaryView result={resultsA.payoutSummary} containerId="summary-a" onPrint={()=>{}} onExport={()=>{}} />
                </ProjectProvider>
            )}
        </div>
        {/* Column B */}
        <div className="space-y-8">
            <h3 className="text-xl font-bold text-center text-interactive">{projectB?.name} ({projectB?.currency})</h3>
             {resultsB && projectB && (
                <ProjectProvider project={projectB}>
                    <ProjectAssessmentView assessment={resultsB.assessment} onAnalyze={() => {}} onPrint={()=>{}} onExport={()=>{}} containerId="assessment-b" />
                    <TotalCapitalizationView result={resultsB.totalCap} containerId="totalcap-b" onPrint={()=>{}} onExport={()=>{}} />
                    <CashflowView result={resultsB.cashflow} containerId="cashflow-b" onPrint={()=>{}} onExport={()=>{}} />
                    <CapTableView capTable={resultsB.capTable} lastRun={lastRun} containerId="captable-b" onPrint={()=>{}} onExport={()=>{}} />
                    <VotingView result={resultsB.voting} lastRun={lastRun} containerId="voting-b" onPrint={()=>{}} onExport={()=>{}} />
                    <WaterfallView result={resultsB.waterfall} containerId="waterfall-b" onPrint={()=>{}} onExport={()=>{}} />
                    <StakeholderPayoutSummaryView result={resultsB.payoutSummary} containerId="summary-b" onPrint={()=>{}} onExport={()=>{}} />
                </ProjectProvider>
            )}
        </div>
      </div>

    </main>
  );
}

export default ComparisonView;