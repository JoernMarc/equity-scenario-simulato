/**
 * Copyright (c) 2025 Jörn Densing, Wachtberg (Deutschland)
 * All Rights Reserved.
 *
 * Permission to use, copy, modify, and distribute this software and its
 * documentation for any purpose and without fee is hereby prohibited,
 * without a written agreement with Jörn Densing, Wachtberg (Deutschland).
 */
import React, { useState, useMemo, useCallback, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import type { Transaction, Shareholding, Stakeholder, WaterfallResult, VotingResult, SampleScenario, FontSize, Theme, CapTable, LegalTab, Project, ParsedImportData, FoundingTransaction, TotalCapitalizationResult, CashflowResult, ProjectAssessmentResult, StakeholderPayoutSummaryResult } from './types';
import { TransactionType, FONT_SIZES, THEMES } from './types';
import Header from './components/Header';
import TransactionList from './components/TransactionList';
import TransactionFormModal from './components/TransactionFormModal';
import PlusIcon from './styles/icons/PlusIcon';
import ConfirmDialog from './components/ConfirmDialog';
import { calculateCapTable, simulateWaterfall, simulateVote, calculateTotalCapitalization, calculateCashflow, assessProject, summarizeWaterfallByStakeholder } from './logic/calculations';
import { exportToExcel, parseExcelImport } from './logic/importExport';
import CapTableView from './components/CapTableView';
import WaterfallView from './components/WaterfallView';
import ImportExportModal from './components/ImportExportModal';
import VotingView from './components/VotingView';
import ProjectDashboard from './components/ProjectDashboard';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import { snakeToCamel } from './logic/utils';
import { useLocalization } from './contexts/LocalizationContext';
import { ProjectProvider } from './contexts/ProjectContext';
import type { Translations } from './i18n';
import PrintIcon from './styles/icons/PrintIcon';
import TotalCapitalizationView from './components/TotalCapitalizationView';
import ChevronLeftIcon from './styles/icons/ChevronLeftIcon';
import ChevronRightIcon from './styles/icons/ChevronRightIcon';
import HelpTooltip from './components/HelpTooltip';
import CashflowView from './components/CashflowView';
import ProjectAssessmentView from './components/ProjectAssessmentView';
import ComparisonView from './components/ComparisonView';
import StakeholderPayoutSummaryView from './components/StakeholderPayoutSummaryView';


// --- STATE STRUCTURE ---
interface AppState {
  projects: Record<string, Project>;
  activeProjectId: string | null;
  comparisonProjectIds: [string | null, string | null];
}

const APP_STATE_STORAGE_KEY = 'capTableAppState_v2';
const ACCESSIBILITY_STORAGE_KEY_PREFIX = 'capTableTheme_v2';

function App() {
  const { t, language, locale } = useLocalization();
  const [appState, setAppState] = useState<AppState>({ projects: {}, activeProjectId: null, comparisonProjectIds: [null, null] });
  const [theme, setTheme] = useState<Theme>('classic');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  
  // New state for point-in-time simulation
  const [simulationDate, setSimulationDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);


  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedStateJSON = localStorage.getItem(APP_STATE_STORAGE_KEY);
      if (savedStateJSON) {
        let savedState: AppState = JSON.parse(savedStateJSON);
        
        // Migration for comparison mode
        if (!savedState.comparisonProjectIds) {
            savedState.comparisonProjectIds = [null, null];
        }

        // --- MIGRATION LOGIC for project currency ---
        let needsUpdate = false;
        Object.values(savedState.projects).forEach(proj => {
            if (!proj.currency) {
                const foundingTx = proj.transactions.find(tx => tx.type === TransactionType.FOUNDING) as FoundingTransaction | undefined;
                if (foundingTx && foundingTx.currency) {
                    proj.currency = foundingTx.currency;
                    delete foundingTx.currency;
                    needsUpdate = true;
                } else {
                    // Fallback for projects that might not have a founding tx or currency property
                    proj.currency = 'EUR';
                    needsUpdate = true;
                }
            }
        });
        
        setAppState(savedState);
        
        // If we migrated, save the updated state back to localStorage
        if (needsUpdate) {
            localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(savedState));
        }
      }
      const savedTheme = localStorage.getItem(`${ACCESSIBILITY_STORAGE_KEY_PREFIX}_theme`);
      if (savedTheme && THEMES.includes(savedTheme as Theme)) {
        setTheme(savedTheme as Theme);
      }
      const savedFontSize = localStorage.getItem(`${ACCESSIBILITY_STORAGE_KEY_PREFIX}_fontSize`);
      if (savedFontSize && FONT_SIZES.includes(savedFontSize as FontSize)) {
        setFontSize(savedFontSize as FontSize);
      }
    } catch (error) {
        console.error("Failed to load or parse state from localStorage", error);
        setAppState({ projects: {}, activeProjectId: null, comparisonProjectIds: [null, null] });
    }
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    try {
        localStorage.setItem(APP_STATE_STORAGE_KEY, JSON.stringify(appState));
    } catch (error) {
        console.error("Failed to save state to localStorage", error);
    }
  }, [appState]);

  // Save accessibility settings and apply classes to body
  useEffect(() => {
    document.body.classList.remove('theme-modern', 'theme-high-contrast', 'theme-classic');
    if (theme === 'modern') {
      document.body.classList.add('theme-modern');
    } else if (theme === 'contrast') {
      document.body.classList.add('theme-high-contrast');
    } else {
      document.body.classList.add('theme-classic');
    }
    localStorage.setItem(`${ACCESSIBILITY_STORAGE_KEY_PREFIX}_theme`, theme);
  }, [theme]);

  useEffect(() => {
    FONT_SIZES.forEach(size => document.body.classList.remove(`font-size-${size}`));
    document.body.classList.add(`font-size-${fontSize}`);
    localStorage.setItem(`${ACCESSIBILITY_STORAGE_KEY_PREFIX}_fontSize`, fontSize);
  }, [fontSize]);


  // --- DERIVED STATE ---
  const activeProject = useMemo(() => appState.activeProjectId ? appState.projects[appState.activeProjectId] : null, [appState]);
  const transactions = useMemo(() => activeProject?.transactions || [], [activeProject]);

  const hasFoundingTransaction = useMemo(() => transactions.some(t => t.type === TransactionType.FOUNDING), [transactions]);
  const isFoundingDeletable = useMemo(() => transactions.length === 1 && hasFoundingTransaction, [transactions, hasFoundingTransaction]);

  const inComparisonMode = useMemo(() => !!(appState.comparisonProjectIds[0] && appState.comparisonProjectIds[1]), [appState.comparisonProjectIds]);

  // Modal & Dialog states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentFormType, setCurrentFormType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null); // Can be project or transaction ID
  const [confirmType, setConfirmType] = useState<'transaction' | 'project' | null>(null);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [legalModalState, setLegalModalState] = useState<{ isOpen: boolean; initialTab?: LegalTab }>({ isOpen: false });


  // Import flow states
  const [parsedImportData, setParsedImportData] = useState<ParsedImportData | null>(null);
  const [importError, setImportError] = useState<string | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Simulation states
  const [exitProceeds, setExitProceeds] = useState<number | ''>('');
  const [transactionCosts, setTransactionCosts] = useState<number | ''>(0);
  const [waterfallResult, setWaterfallResult] = useState<WaterfallResult | null>(null);
  const [stakeholderPayoutSummaryResult, setStakeholderPayoutSummaryResult] = useState<StakeholderPayoutSummaryResult | null>(null);
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null);
  const [projectAssessment, setProjectAssessment] = useState<ProjectAssessmentResult | null>(null);
  const [pendingModalType, setPendingModalType] = useState<TransactionType | null>(null);
  const [capTableLastRun, setCapTableLastRun] = useState<string | null>(null);
  const [waterfallLastRun, setWaterfallLastRun] = useState<string | null>(null);
  const [votingLastRun, setVotingLastRun] = useState<string | null>(null);


  // --- HANDLERS ---
  const handleOpenModal = useCallback((type: TransactionType) => {
    if (!hasFoundingTransaction && type !== TransactionType.FOUNDING) {
      alert(t.noTransactions);
      setPendingModalType(type);
      setCurrentFormType(TransactionType.FOUNDING);
      setEditingTransaction(null);
      setIsModalOpen(true);
      return;
    }
    setCurrentFormType(type);
    setEditingTransaction(null);
    setIsModalOpen(true);
  }, [hasFoundingTransaction, t]);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingTransaction(null);
    setCurrentFormType(null);
    setPendingModalType(null);
  }, []);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setCurrentFormType(transaction.type);
    setIsModalOpen(true);
  }, []);

  const handleDeleteRequest = useCallback((type: 'transaction' | 'project', id: string) => {
    setDeletingId(id);
    setConfirmType(type);
    setIsConfirmOpen(true);
  }, []);

  // Reset simulation results when project switches
  useEffect(() => {
    setExitProceeds('');
    setTransactionCosts(0);
    setSearchQuery('');
    setSimulationDate(new Date().toISOString().split('T')[0]); // Reset date on project change
    if (activeProject) {
        document.title = `${activeProject.name} - ${t.appTitle}`;
    } else if (inComparisonMode) {
        document.title = `${t.comparisonViewTitle} - ${t.appTitle}`;
    } else {
        document.title = t.appTitle;
    }
  }, [appState.activeProjectId, inComparisonMode, t.appTitle, t.comparisonViewTitle]);

  // Reset calculation results when underlying data changes
  useEffect(() => {
    setWaterfallResult(null);
    setStakeholderPayoutSummaryResult(null);
    setVotingResult(null);
    setProjectAssessment(null);
    setCapTableLastRun(null);
    setWaterfallLastRun(null);
    setVotingLastRun(null);
  }, [transactions, simulationDate]);
  
  const capTableResult = useMemo((): CapTable | null => {
    if (!hasFoundingTransaction || inComparisonMode) return null;
    return calculateCapTable(transactions, simulationDate);
  }, [transactions, simulationDate, hasFoundingTransaction, inComparisonMode]);

  useEffect(() => {
      if (capTableResult) {
          setCapTableLastRun(new Date().toLocaleString(locale));
      } else {
          setCapTableLastRun(null);
      }
  }, [capTableResult, locale]);

  const totalCapitalizationResult = useMemo((): TotalCapitalizationResult | null => {
    if (!capTableResult || !activeProject) return null;
    return calculateTotalCapitalization(transactions, capTableResult, simulationDate, t, locale, activeProject.currency);
  }, [capTableResult, transactions, simulationDate, t, locale, activeProject]);
  
  const cashflowResult = useMemo((): CashflowResult | null => {
      if (!hasFoundingTransaction || inComparisonMode) return null;
      return calculateCashflow(transactions, simulationDate, t, activeProject?.currency || 'EUR');
  }, [transactions, simulationDate, hasFoundingTransaction, inComparisonMode, activeProject, t]);

  useMemo(() => {
      if(waterfallResult) {
          setStakeholderPayoutSummaryResult(summarizeWaterfallByStakeholder(waterfallResult));
      } else {
          setStakeholderPayoutSummaryResult(null);
      }
  }, [waterfallResult]);
  
  // Re-calculate assessment on language change if it's already displayed
  useEffect(() => {
    setProjectAssessment(currentAssessment => {
        if (currentAssessment && capTableResult) {
            return assessProject(transactions, capTableResult, t);
        }
        return currentAssessment;
    });
  }, [t, capTableResult, transactions]);


  const getOrCreateStakeholder = (name: string, currentStakeholders: Stakeholder[]): { id: string, updatedStakeholders: Stakeholder[] } => {
    const existing = currentStakeholders.find(s => s.name.toLowerCase() === name.toLowerCase());
    if (existing) {
      return { id: existing.id, updatedStakeholders: currentStakeholders };
    }
    const newStakeholder = { id: crypto.randomUUID(), name };
    return { id: newStakeholder.id, updatedStakeholders: [...currentStakeholders, newStakeholder] };
  };

  const handleTransactionSubmit = useCallback((transaction: Transaction) => {
    if (!appState.activeProjectId) return;
    
    setAppState(currentAppState => {
      const newAppState = { ...currentAppState };
      const project = { ...newAppState.projects[appState.activeProjectId!] };
      let newStakeholders = [...project.stakeholders];

      const processShareholdings = (shareholdings: Shareholding[]) => {
        shareholdings.forEach(sh => {
            if (!sh.stakeholderId) {
                const { id, updatedStakeholders } = getOrCreateStakeholder(sh.stakeholderName, newStakeholders);
                sh.stakeholderId = id;
                newStakeholders = updatedStakeholders;
            }
        });
      };
      
      if (transaction.type === TransactionType.FOUNDING && transaction.currency) {
          project.currency = transaction.currency;
          delete transaction.currency; // Remove from transaction object after setting on project
      }

      if (transaction.type === TransactionType.FOUNDING) {
        processShareholdings(transaction.shareholdings);
      } else if (transaction.type === TransactionType.FINANCING_ROUND) {
        processShareholdings(transaction.newShareholdings);
      } else if (transaction.type === TransactionType.CONVERTIBLE_LOAN) {
        const { id, updatedStakeholders } = getOrCreateStakeholder(transaction.investorName, newStakeholders);
        transaction.stakeholderId = id;
        newStakeholders = updatedStakeholders;
      } else if (transaction.type === TransactionType.SHARE_TRANSFER) {
        const { id, updatedStakeholders } = getOrCreateStakeholder(transaction.buyerStakeholderName, newStakeholders);
        transaction.buyerStakeholderId = id;
        newStakeholders = updatedStakeholders;
      } else if (transaction.type === TransactionType.EQUALIZATION_PURCHASE) {
         const { id, updatedStakeholders } = getOrCreateStakeholder(transaction.newStakeholderName, newStakeholders);
        transaction.newStakeholderId = id;
        newStakeholders = updatedStakeholders;
      } else if (transaction.type === TransactionType.DEBT_INSTRUMENT) {
        getOrCreateStakeholder(transaction.lenderName, newStakeholders);
      }

      project.stakeholders = newStakeholders;
      
      const txIndex = project.transactions.findIndex(t => t.id === transaction.id);
      if (txIndex > -1) {
        project.transactions[txIndex] = transaction;
      } else {
        project.transactions.push(transaction);
      }
      
      project.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      newAppState.projects[appState.activeProjectId!] = project;
      return newAppState;
    });

    handleCloseModal();
    if(pendingModalType) {
        handleOpenModal(pendingModalType);
        setPendingModalType(null);
    }
  }, [appState.activeProjectId, handleCloseModal, pendingModalType, handleOpenModal]);

  const handleConfirmDelete = useCallback(() => {
    if (!deletingId || !confirmType) return;
    
    if (confirmType === 'transaction') {
        setAppState(currentAppState => {
          if (!currentAppState.activeProjectId) return currentAppState;
          const newAppState = { ...currentAppState };
          const project = { ...newAppState.projects[currentAppState.activeProjectId] };
          project.transactions = project.transactions.filter(tx => tx.id !== deletingId);
          newAppState.projects[currentAppState.activeProjectId] = project;
          return newAppState;
        });
    } else if (confirmType === 'project') {
       setAppState(currentAppState => {
          const newProjects = { ...currentAppState.projects };
          delete newProjects[deletingId];
          const newComparisonIds = [...currentAppState.comparisonProjectIds];
          if (newComparisonIds[0] === deletingId) newComparisonIds[0] = null;
          if (newComparisonIds[1] === deletingId) newComparisonIds[1] = null;

          return {
            projects: newProjects,
            activeProjectId: currentAppState.activeProjectId === deletingId ? null : currentAppState.activeProjectId,
            comparisonProjectIds: newComparisonIds as [string | null, string | null]
          };
       });
    }

    setIsConfirmOpen(false);
    setDeletingId(null);
    setConfirmType(null);
  }, [deletingId, confirmType]);

  const handleSimulateWaterfall = (e: React.FormEvent) => {
    e.preventDefault();
    if (capTableResult && exitProceeds !== '') {
        const proceeds = exitProceeds as number;
        const costs = transactionCosts === '' ? 0 : transactionCosts as number;

        if (isNaN(proceeds) || isNaN(costs)) {
            console.error("Invalid input for waterfall simulation.");
            return;
        }

        const result = simulateWaterfall(capTableResult, transactions, proceeds, costs, language);
        setWaterfallResult(result);
        setWaterfallLastRun(new Date().toLocaleString(locale));
    }
  };

  const handleSimulateVote = () => {
    if (capTableResult) {
      const result = simulateVote(capTableResult, transactions);
      setVotingResult(result);
      setVotingLastRun(new Date().toLocaleString(locale));
    }
  };
  
  const handleAnalyzeProject = useCallback(() => {
    if (capTableResult) {
        const result = assessProject(transactions, capTableResult, t);
        setProjectAssessment(result);
    }
  }, [capTableResult, transactions, t]);

  const handleOpenImportExportModal = () => setIsImportExportModalOpen(true);
  const handleCloseImportExportModal = () => setIsImportExportModalOpen(false);

  const handleExportProject = () => {
    if (activeProject) {
        const dataStr = JSON.stringify({ ...activeProject, id: undefined }, null, 2); // Export without project id
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `${activeProject.name.replace(/\s/g, '_')}_export.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
    }
  };

  const handleExportExcelTemplate = () => {
    if(activeProject) {
        exportToExcel(activeProject);
    }
  }

  const handleImportFile = async (file: File) => {
    setImportError(null);
    setParsedImportData(null);
    try {
        const parsedData = await parseExcelImport(file);
        setParsedImportData(parsedData);
    } catch(e: any) {
        setImportError(e.message);
    }
  };

  const handleConfirmImport = () => {
    if (parsedImportData) {
        const newProject: Project = {
            id: crypto.randomUUID(),
            name: parsedImportData.projectName,
            currency: 'EUR', // Default for imported projects, can be changed if specified in Excel
            transactions: parsedImportData.transactions,
            stakeholders: parsedImportData.stakeholders
        };
        setAppState(s => ({
            ...s,
            projects: {
                ...s.projects,
                [newProject.id]: newProject
            },
            activeProjectId: newProject.id,
            comparisonProjectIds: [null, null]
        }));
        setParsedImportData(null);
        setIsImportExportModalOpen(false);
    }
  };

  const handleClearImportPreview = () => {
      setParsedImportData(null);
      setImportError(null);
  };
  
  const handleCreateProject = (name: string) => {
    const newProject: Project = { id: crypto.randomUUID(), name, currency: '', transactions: [], stakeholders: [] };
    setAppState(s => {
      const newState = {
          projects: { ...s.projects, [newProject.id]: newProject },
          activeProjectId: newProject.id,
          comparisonProjectIds: [null, null] as [string|null, string|null]
      };
      return newState;
    });
    setPendingModalType(null);
    handleOpenModal(TransactionType.FOUNDING);
  };

  const handleSelectProject = (id: string) => {
    setAppState(s => ({ ...s, activeProjectId: id, comparisonProjectIds: [null, null] }));
  };
  
  const handleRenameProject = (id: string, newName: string) => {
      setAppState(s => {
          const project = s.projects[id];
          if(project) {
              const updatedProject = {...project, name: newName};
              return {
                  ...s,
                  projects: {...s.projects, [id]: updatedProject}
              };
          }
          return s;
      });
  }

  const handleBackToDashboard = () => {
    setAppState(s => ({...s, activeProjectId: null, comparisonProjectIds: [null, null]}));
  };
  
  const handleLoadScenario = (scenarioData: SampleScenario['data']) => {
      const newProject: Project = {
          id: crypto.randomUUID(),
          name: scenarioData.projectName,
          currency: 'EUR', // Sample scenarios are in EUR
          transactions: scenarioData.transactions,
          stakeholders: scenarioData.stakeholders
      };
       setAppState(s => ({
            projects: { ...s.projects, [newProject.id]: newProject },
            activeProjectId: newProject.id,
            comparisonProjectIds: [null, null]
        }));
  };
  
  const handleOpenLegalModal = (initialTab?: LegalTab) => {
      setLegalModalState({ isOpen: true, initialTab });
  };
  
  const handleCloseLegalModal = () => {
      setLegalModalState({ isOpen: false });
  };
  
  const handleIncreaseFontSize = () => {
      const currentIndex = FONT_SIZES.indexOf(fontSize);
      if (currentIndex < FONT_SIZES.length - 1) {
          setFontSize(FONT_SIZES[currentIndex + 1]);
      }
  };

  const handleDecreaseFontSize = () => {
      const currentIndex = FONT_SIZES.indexOf(fontSize);
      if (currentIndex > 0) {
          setFontSize(FONT_SIZES[currentIndex - 1]);
      }
  };

  const handlePrint = (containerId: string) => {
    const style = document.createElement('style');
    style.id = 'temp-print-style';
    
    let selectorsToHide = [
        'header', 'footer', '.no-print', '#simulation-controls-row'
    ];

    if (inComparisonMode) {
        selectorsToHide = ['header', 'footer', '.no-print', '#comparison-controls'];
    } else {
        const resultsViews = ['cap-table-view', 'voting-view', 'waterfall-view', 'total-capitalization-view', 'cashflow-view', 'project-assessment-view', 'stakeholder-payout-summary-view'];
        if (resultsViews.includes(containerId)) {
            selectorsToHide.push('#transaction-column');
        } else { // printing transaction column
            selectorsToHide.push('#results-column');
        }
    }
    
    style.innerHTML = `@media print { ${selectorsToHide.join(', ')} { display: none !important; } }`;
    document.head.appendChild(style);

    window.print();

    // Use a timeout to ensure the print dialog has time to process before removing the style
    setTimeout(() => {
        const styleElement = document.getElementById('temp-print-style');
        if (styleElement) {
            document.head.removeChild(styleElement);
        }
    }, 500);
  };

  const handleExportImage = async (format: 'png' | 'pdf', containerId: string) => {
      const element = document.getElementById(containerId);
      if (element) {
          const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: 'rgb(var(--color-bg-surface))' });
          if(format === 'png') {
              const image = canvas.toDataURL('image/png');
              const link = document.createElement('a');
              link.href = image;
              link.download = `${activeProject?.name}_${containerId}.png`;
              link.click();
          } else { // pdf
              const imgData = canvas.toDataURL('image/jpeg', 0.9);
              const pdf = new jsPDF({
                  orientation: 'landscape',
                  unit: 'px',
                  format: [canvas.width, canvas.height]
              });
              pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
              pdf.save(`${activeProject?.name}_${containerId}.pdf`);
          }
      }
  };
  
  const getConfirmDialogMessage = (): string => {
    if (confirmType === 'project' && deletingId) {
      const projectName = appState.projects[deletingId]?.name || '';
      return t.confirmDeleteProjectMessage.replace('{projectName}', projectName);
    }
    return t.confirmDeleteMessage;
  };

  const toggleNav = () => setIsNavCollapsed(prev => !prev);
  
  const handleStartComparison = (projectIds: [string, string]) => {
      setAppState(s => ({
          ...s,
          activeProjectId: null,
          comparisonProjectIds: projectIds
      }));
  };
  
  const handleStopComparison = () => {
       setAppState(s => ({
          ...s,
          comparisonProjectIds: [null, null]
      }));
  };

  const handleChangeComparedProject = (index: 0 | 1, newProjectId: string) => {
      setAppState(s => {
          const newComparisonIds = [...s.comparisonProjectIds] as [string | null, string | null];
          newComparisonIds[index] = newProjectId;
          return {
              ...s,
              comparisonProjectIds: newComparisonIds
          };
      });
  };

  const renderContent = () => {
      if (inComparisonMode) {
          return <ComparisonView 
                    projectIds={appState.comparisonProjectIds as [string, string]}
                    allProjects={Object.values(appState.projects)}
                    onStopComparison={handleStopComparison}
                    onChangeProject={handleChangeComparedProject}
                    onPrint={() => handlePrint('comparison-view-container')}
                  />;
      }
      if (!activeProject) {
          return <ProjectDashboard
                    projects={Object.values(appState.projects)}
                    onCreateProject={handleCreateProject}
                    onSelectProject={handleSelectProject}
                    onRenameProject={handleRenameProject}
                    onDeleteProject={(id) => handleDeleteRequest('project', id)}
                    onLoadScenario={handleLoadScenario}
                    onStartComparison={handleStartComparison}
                  />;
      }
      // Single Project View
      return (
        <ProjectProvider project={activeProject}>
            <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
              <div className="flex justify-between items-center flex-wrap gap-4 no-print">
                <h2 className="text-2xl font-bold text-primary">{t.activeProject}: <span className="text-interactive">{activeProject.name} ({activeProject.currency})</span></h2>
                <button onClick={handleBackToDashboard} className="text-sm text-interactive hover:underline">{t.backToDashboard}</button>
              </div>
              
              <div className="flex flex-col xl:flex-row gap-8">
                  {/* Left Column: Transactions */}
                  <aside
                    id="transaction-column"
                    className={`
                      flex flex-col gap-6 flex-shrink-0 transition-all duration-300 ease-in-out 
                      ${isNavCollapsed ? 'w-full xl:w-20' : 'w-full xl:w-2/5'}
                    `}
                  >
                    <div className={`no-print ${isNavCollapsed ? 'hidden' : ''}`}>
                      <label htmlFor="search-input" className="block text-sm font-medium text-secondary mb-1">{t.search}</label>
                      <input
                          id="search-input"
                          type="text"
                          placeholder={t.searchPlaceholder}
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full px-4 py-2 bg-surface border border-strong rounded-md"
                      />
                    </div>

                    <div id="transaction-log-view" className="bg-surface p-4 sm:p-6 rounded-lg shadow-sm border border-subtle h-full flex flex-col flex-grow">
                      <div className="flex items-center mb-4 gap-2">
                        <div className="flex items-center gap-4">
                          <button onClick={toggleNav} className="p-2 rounded-md transition-colors text-secondary hover:bg-background-subtle no-print" title={isNavCollapsed ? t.expand : t.collapse}>
                            {isNavCollapsed ? <ChevronRightIcon className="w-5 h-5" /> : <ChevronLeftIcon className="w-5 h-5" />}
                          </button>
                          <h3 className={`text-xl font-semibold text-primary ${isNavCollapsed ? 'hidden' : ''}`}>
                            {t.transactionLog}
                          </h3>
                        </div>
                        <div className="flex-grow" />
                        <div className={`flex items-center gap-2 no-print ${isNavCollapsed ? 'hidden' : ''}`}>
                          <div className="relative group">
                            <button className="flex items-center gap-2 w-full justify-center px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover">
                              <PlusIcon className="w-5 h-5" />
                              <span>{t.addTransaction}</span>
                            </button>
                            <div className="absolute right-0 mt-2 w-56 origin-top-right bg-surface border border-subtle rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                              <div className="py-1">
                                {Object.values(TransactionType).map(type => {
                                  const translationKey = snakeToCamel(type) as keyof Translations;
                                  const buttonText = t[translationKey];
                                  return (
                                    <button key={type} onClick={() => handleOpenModal(type)} className="w-full text-left block px-4 py-2 text-sm text-primary hover:bg-background-subtle">
                                      {typeof buttonText === 'string' ? buttonText : translationKey}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => handlePrint('transaction-log-view')} className="p-2 rounded-md transition-colors text-secondary hover:bg-background-subtle" title={t.print}>
                            <PrintIcon className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                      <div className={`flex-grow overflow-y-auto ${isNavCollapsed ? 'hidden' : ''}`}>
                        <TransactionList
                            onEdit={handleEditTransaction}
                            onDelete={(id) => handleDeleteRequest('transaction', id)}
                            isFoundingDeletable={isFoundingDeletable}
                            searchQuery={searchQuery}
                            simulationDate={simulationDate}
                        />
                      </div>
                    </div>
                  </aside>
                  
                  {/* Right Column: Simulations & Results */}
                  <section id="results-column" className="flex-grow space-y-8">
                      <div className="bg-surface p-4 rounded-lg shadow-sm border border-subtle no-print">
                        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
                            <h3 className="text-xl font-semibold text-primary">{t.resultsDisplay}</h3>
                            <div className="flex items-center gap-2">
                                <label htmlFor="simulationDate" className="block text-sm font-medium text-secondary whitespace-nowrap">{t.simulationDateLabel}</label>
                                <input
                                    type="date"
                                    id="simulationDate"
                                    value={simulationDate}
                                    onChange={(e) => setSimulationDate(e.target.value)}
                                    className="px-3 py-1 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-1 ring-interactive"
                                />
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* Voting Section */}
                            <div className="space-y-3">
                                <h4 className="font-semibold text-primary">{t.votingSimulationTitle}</h4>
                                <div className="flex items-center gap-4">
                                    <button onClick={handleSimulateVote} className="px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover">{t.simulateVote}</button>
                                    {votingLastRun && <p className="text-xs text-secondary">{t.lastRun}: {votingLastRun}</p>}
                                </div>
                            </div>
                            
                            <div className="border-t border-subtle"></div>
                            
                            {/* Waterfall Section */}
                            <form onSubmit={handleSimulateWaterfall} className="space-y-3">
                                <h4 className="font-semibold text-primary">{t.waterfallSimulationTitle}</h4>
                                <div className="flex items-end gap-4 flex-wrap">
                                    <div>
                                        <label htmlFor="exitProceeds" className="flex items-center text-xs font-medium text-secondary">
                                            {t.exitProceeds}
                                            <HelpTooltip text={t.help.exitProceeds} />
                                        </label>
                                        <input 
                                            type="number" 
                                            id="exitProceeds" 
                                            value={exitProceeds} 
                                            onChange={e => setExitProceeds(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                                            required 
                                            className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md text-right" 
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="transactionCosts" className="flex items-center text-xs font-medium text-secondary">
                                            {t.transactionCosts}
                                            <HelpTooltip text={t.help.transactionCosts} />
                                        </label>
                                        <input 
                                            type="number" 
                                            id="transactionCosts" 
                                            value={transactionCosts} 
                                            onChange={e => setTransactionCosts(e.target.value === '' ? '' : parseFloat(e.target.value))} 
                                            className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md text-right" 
                                        />
                                    </div>
                                    <button type="submit" className="px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover whitespace-nowrap">{t.simulateWaterfall}</button>
                                </div>
                                {waterfallLastRun && <p className="text-xs text-secondary mt-1">{t.lastRun}: {waterfallLastRun}</p>}
                            </form>
                        </div>
                      </div>
                      
                      {capTableResult && (
                        <ProjectAssessmentView 
                            assessment={projectAssessment}
                            onAnalyze={handleAnalyzeProject}
                            containerId="project-assessment-view"
                            onPrint={() => handlePrint('project-assessment-view')}
                            onExport={(format) => handleExportImage(format, 'project-assessment-view')}
                        />
                      )}

                      {totalCapitalizationResult && (
                        <div className="mb-8">
                            <TotalCapitalizationView
                                result={totalCapitalizationResult}
                                containerId="total-capitalization-view"
                                onPrint={() => handlePrint('total-capitalization-view')}
                                onExport={(format) => handleExportImage(format, 'total-capitalization-view')}
                            />
                        </div>
                       )}
                       {cashflowResult && (
                        <div className="mb-8">
                            <CashflowView
                                result={cashflowResult}
                                containerId="cashflow-view"
                                onPrint={() => handlePrint('cashflow-view')}
                                onExport={(format) => handleExportImage(format, 'cashflow-view')}
                            />
                        </div>
                        )}
                      <CapTableView
                          capTable={capTableResult}
                          lastRun={capTableLastRun}
                          onPrint={() => handlePrint('cap-table-view')}
                          onExport={(format) => handleExportImage(format, 'cap-table-view')}
                          containerId="cap-table-view"
                      />
                      
                      {capTableResult && (
                        <>
                          <VotingView 
                              result={votingResult}
                              lastRun={votingLastRun}
                              onPrint={() => handlePrint('voting-view')}
                              onExport={(format) => handleExportImage(format, 'voting-view')}
                              containerId="voting-view"
                          />

                          <WaterfallView 
                              result={waterfallResult}
                              onPrint={() => handlePrint('waterfall-view')}
                              onExport={(format) => handleExportImage(format, 'waterfall-view')}
                              containerId="waterfall-view"
                          />
                          
                          <StakeholderPayoutSummaryView
                            result={stakeholderPayoutSummaryResult}
                            containerId="stakeholder-payout-summary-view"
                            onPrint={() => handlePrint('stakeholder-payout-summary-view')}
                            onExport={(format) => handleExportImage(format, 'stakeholder-payout-summary-view')}
                          />
                        </>
                      )}
                  </section>
              </div>
            </main>
          </ProjectProvider>
      );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-primary">
      <Header
        onOpenImportExportModal={handleOpenImportExportModal}
        theme={theme}
        setTheme={setTheme}
        fontSize={fontSize}
        onIncreaseFontSize={handleIncreaseFontSize}
        onDecreaseFontSize={handleDecreaseFontSize}
      />
      <div className="flex-grow w-full">
        {renderContent()}
      </div>
      <Footer onOpenLegalModal={handleOpenLegalModal} />

      {isModalOpen && (
        <ProjectProvider project={activeProject}>
            <TransactionFormModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                formType={currentFormType}
                onSubmit={handleTransactionSubmit}
                transactionToEdit={editingTransaction}
                capTable={capTableResult}
            />
        </ProjectProvider>
      )}
      <ConfirmDialog 
        isOpen={isConfirmOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        title={confirmType === 'project' ? t.confirmDeleteProjectTitle : t.confirmDelete}
        message={getConfirmDialogMessage()}
      />
      <ImportExportModal 
        isOpen={isImportExportModalOpen}
        onClose={handleCloseImportExportModal}
        onExport={handleExportProject}
        onExportExcelTemplate={handleExportExcelTemplate}
        onImport={handleImportFile}
        parsedImportData={parsedImportData}
        importError={importError}
        onConfirmImport={handleConfirmImport}
        onClearImportPreview={handleClearImportPreview}
        isExportDisabled={!activeProject && !inComparisonMode}
      />
      <LegalModal 
        isOpen={legalModalState.isOpen}
        onClose={handleCloseLegalModal}
        initialTab={legalModalState.initialTab}
      />
    </div>
  );
}

export default App;