/**
 * Copyright (c) 2025 Jörn Densing, Wachtberg (Deutschland)
 * All Rights Reserved.
 *
 * Permission to use, copy, modify, and distribute this software and its
 * documentation for any purpose and without fee is hereby prohibited,
 * without a written agreement with Jörn Densing, Wachtberg (Deutschland).
 */
import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

import type { Transaction, ConvertibleLoanTransaction, Shareholding, Stakeholder, WaterfallResult, TotalCapitalizationResult, TotalCapitalizationEntry, FinancingRoundTransaction, FoundingTransaction, ShareClass, BaseTransaction, VotingResult, SampleScenario, DebtInstrumentTransaction, FontSize, Theme, UpdateShareClassTransaction, ShareTransferTransaction, CapTable, EqualizationPurchaseTransaction, LegalTab, Project, ParsedImportData } from './types';
import { TransactionType, TransactionStatus, FONT_SIZES, THEMES } from './types';
import Header from './components/Header';
import TransactionList from './components/TransactionList';
import TransactionFormModal from './components/TransactionFormModal';
import PlusIcon from './styles/icons/PlusIcon';
import ConfirmDialog from './components/ConfirmDialog';
import { calculateCapTable, simulateWaterfall, simulateVote } from './logic/calculations';
import { exportToExcel, parseExcelImport } from './logic/importExport';
import CapTableView from './components/CapTableView';
import WaterfallView from './components/WaterfallView';
import TotalCapitalizationView from './components/TotalCapitalizationView';
import ImportExportModal from './components/ImportExportModal';
import VotingView from './components/VotingView';
import ProjectDashboard from './components/ProjectDashboard';
import Footer from './components/Footer';
import LegalModal from './components/LegalModal';
import { snakeToCamel } from './logic/utils';
import { useLocalization } from './contexts/LocalizationContext';
import type { Translations } from './i18n';


// --- STATE STRUCTURE ---
interface AppState {
  projects: Record<string, Project>;
  activeProjectId: string | null;
}

const APP_STATE_STORAGE_KEY = 'capTableAppState_v2';
const ACCESSIBILITY_STORAGE_KEY_PREFIX = 'capTableTheme_v2';

function App() {
  const { t, locale, language } = useLocalization();
  const [appState, setAppState] = useState<AppState>({ projects: {}, activeProjectId: null });
  const [theme, setTheme] = useState<Theme>('classic');
  const [fontSize, setFontSize] = useState<FontSize>('base');
  
  // New state for point-in-time simulation
  const [simulationDate, setSimulationDate] = useState<string>(new Date().toISOString().split('T')[0]);

  // Load state from localStorage on initial render
  useEffect(() => {
    try {
      const savedState = localStorage.getItem(APP_STATE_STORAGE_KEY);
      if (savedState) {
        setAppState(JSON.parse(savedState));
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
        setAppState({ projects: {}, activeProjectId: null });
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
  const stakeholders = useMemo(() => activeProject?.stakeholders || [], [activeProject]);

  const hasFoundingTransaction = useMemo(() => transactions.some(t => t.type === TransactionType.FOUNDING), [transactions]);
  const isFoundingDeletable = useMemo(() => transactions.length === 1 && hasFoundingTransaction, [transactions, hasFoundingTransaction]);

  const projectCurrency = useMemo(() => {
    const foundingTx = transactions.find(tx => tx.type === TransactionType.FOUNDING) as FoundingTransaction | undefined;
    return foundingTx?.currency || 'EUR';
  }, [transactions]);

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
  const [transactionCosts, setTransactionCosts] = useState<number | ''>('');
  const [waterfallResult, setWaterfallResult] = useState<WaterfallResult | null>(null);
  const [votingResult, setVotingResult] = useState<VotingResult | null>(null);
  const [pendingModalType, setPendingModalType] = useState<TransactionType | null>(null);


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
  }, [hasFoundingTransaction, t.noTransactions]);

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

  // Reset simulation results when transactions change or project switches
  useEffect(() => {
    setExitProceeds('');
    setTransactionCosts('');
    setWaterfallResult(null);
    setVotingResult(null);
    setSearchQuery('');
    setSimulationDate(new Date().toISOString().split('T')[0]); // Reset date on project change
    if (activeProject) {
        document.title = `${activeProject.name} - ${t.appTitle}`;
    } else {
        document.title = t.appTitle;
    }
  }, [appState.activeProjectId, activeProject, t.appTitle]);
  
  const capTableResult = useMemo((): CapTable | null => {
    if (!hasFoundingTransaction) return null;
    return calculateCapTable(transactions, simulationDate);
  }, [transactions, simulationDate, hasFoundingTransaction]);

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
          return {
            projects: newProjects,
            activeProjectId: currentAppState.activeProjectId === deletingId ? null : currentAppState.activeProjectId
          };
       });
    }

    setIsConfirmOpen(false);
    setDeletingId(null);
    setConfirmType(null);
  }, [deletingId, confirmType]);

  const handleSimulateWaterfall = (e: React.FormEvent) => {
    e.preventDefault();
    if (capTableResult && exitProceeds !== '' && transactionCosts !== '') {
      const result = simulateWaterfall(capTableResult, transactions, exitProceeds, transactionCosts, language);
      setWaterfallResult(result);
    }
  };

  const handleSimulateVote = () => {
    if (capTableResult) {
      const result = simulateVote(capTableResult, transactions);
      setVotingResult(result);
    }
  };
  
  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const lowerCaseQuery = searchQuery.toLowerCase();
    return transactions.filter(tx => {
      const txString = JSON.stringify(tx).toLowerCase();
      return txString.includes(lowerCaseQuery);
    });
  }, [searchQuery, transactions]);

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
            transactions: parsedImportData.transactions,
            stakeholders: parsedImportData.stakeholders
        };
        setAppState(s => ({
            ...s,
            projects: {
                ...s.projects,
                [newProject.id]: newProject
            },
            activeProjectId: newProject.id
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
    const newProject: Project = { id: crypto.randomUUID(), name, transactions: [], stakeholders: [] };
    setAppState(s => {
      const newState = {
          projects: { ...s.projects, [newProject.id]: newProject },
          activeProjectId: newProject.id
      };
      return newState;
    });
    setPendingModalType(null);
    handleOpenModal(TransactionType.FOUNDING);
  };

  const handleSelectProject = (id: string) => {
    setAppState(s => ({ ...s, activeProjectId: id }));
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
    setAppState(s => ({...s, activeProjectId: null}));
  };
  
  const handleLoadScenario = (scenarioData: SampleScenario['data']) => {
      const newProject: Project = {
          id: crypto.randomUUID(),
          name: scenarioData.projectName,
          transactions: scenarioData.transactions,
          stakeholders: scenarioData.stakeholders
      };
       setAppState(s => ({
            projects: { ...s.projects, [newProject.id]: newProject },
            activeProjectId: newProject.id
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

  const printRef = useRef(null);

  const handlePrint = async (containerId: string) => {
    const element = document.getElementById(containerId);
    if (element) {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: 'rgb(var(--color-bg-surface))' });
        const data = canvas.toDataURL('image/png');
        
        const printWindow = window.open('', '', 'height=800,width=1200');
        printWindow?.document.write('<html><head><title>Print</title></head><body>');
        printWindow?.document.write(`<img src="${data}" style="width:100%;" />`);
        printWindow?.document.write('</body></html>');
        printWindow?.document.close();
        printWindow?.focus();
        setTimeout(() => printWindow?.print(), 500);
    }
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
        {!activeProject ? (
          <ProjectDashboard
            projects={Object.values(appState.projects)}
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
            onRenameProject={handleRenameProject}
            onDeleteProject={(id) => handleDeleteRequest('project', id)}
            onLoadScenario={handleLoadScenario}
          />
        ) : (
          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8" ref={printRef}>
            <div className="flex justify-between items-center flex-wrap gap-4">
              <h2 className="text-2xl font-bold text-primary">{t.activeProject}: <span className="text-interactive">{activeProject.name}</span></h2>
              <button onClick={handleBackToDashboard} className="text-sm text-interactive hover:underline">{t.backToDashboard}</button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column: Transactions */}
                <div className="space-y-6">
                    <div className="flex justify-between items-center flex-wrap gap-4">
                      <h3 className="text-xl font-semibold text-primary">{t.transactionLog}</h3>
                       <div className="relative group">
                          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover">
                            <PlusIcon className="w-5 h-5" /> {t.addTransaction}
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
                    </div>
                    <input
                      type="text"
                      placeholder={t.searchPlaceholder}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-4 py-2 bg-surface border border-strong rounded-md"
                    />
                    <TransactionList
                        transactions={filteredTransactions}
                        allTransactions={transactions}
                        stakeholders={stakeholders}
                        onEdit={handleEditTransaction}
                        onDelete={(id) => handleDeleteRequest('transaction', id)}
                        isFoundingDeletable={isFoundingDeletable}
                        searchQuery={searchQuery}
                        simulationDate={simulationDate}
                        projectCurrency={projectCurrency}
                    />
                </div>
                
                {/* Right Column: Simulations & Results */}
                <div className="space-y-8">
                    <div>
                        <h3 className="text-xl font-semibold text-primary mb-4">{t.resultsDisplay}</h3>
                        <div className="flex items-center gap-4 mb-6">
                            <label htmlFor="simulationDate" className="text-sm font-medium text-secondary whitespace-nowrap">{t.simulationDateLabel}:</label>
                            <input
                                type="date"
                                id="simulationDate"
                                value={simulationDate}
                                onChange={(e) => setSimulationDate(e.target.value)}
                                className="w-full px-3 py-2 bg-surface border border-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-interactive"
                            />
                        </div>
                         <CapTableView
                            capTable={capTableResult}
                            onPrint={() => handlePrint('cap-table-view')}
                            onExport={(format) => handleExportImage(format, 'cap-table-view')}
                            containerId="cap-table-view"
                        />
                    </div>
                    
                    {capTableResult && (
                      <>
                        <div className="space-y-4">
                            <VotingView 
                                result={votingResult}
                                onPrint={() => handlePrint('voting-view')}
                                onExport={(format) => handleExportImage(format, 'voting-view')}
                                containerId="voting-view"
                            />
                            <div className="text-center">
                                <button onClick={handleSimulateVote} className="px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover">{t.simulateVote}</button>
                            </div>
                        </div>

                         <div className="space-y-4">
                            <WaterfallView 
                                result={waterfallResult}
                                onPrint={() => handlePrint('waterfall-view')}
                                onExport={(format) => handleExportImage(format, 'waterfall-view')}
                                containerId="waterfall-view"
                                projectCurrency={projectCurrency}
                            />
                             <form onSubmit={handleSimulateWaterfall} className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                                <div>
                                    <label htmlFor="exitProceeds" className="block text-sm font-medium text-secondary">{t.exitProceeds}</label>
                                    <input type="number" id="exitProceeds" value={exitProceeds} onChange={e => setExitProceeds(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md" placeholder="10000000" />
                                </div>
                                <div>
                                    <label htmlFor="transactionCosts" className="block text-sm font-medium text-secondary">{t.transactionCosts}</label>
                                    <input type="number" id="transactionCosts" value={transactionCosts} onChange={e => setTransactionCosts(e.target.value === '' ? '' : parseFloat(e.target.value))} className="mt-1 block w-full px-3 py-2 bg-surface border border-strong rounded-md" placeholder="500000" />
                                </div>
                                <div className="sm:col-span-2 text-center">
                                    <button type="submit" className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-on-interactive bg-interactive rounded-md hover:bg-interactive-hover">{t.simulateWaterfall}</button>
                                </div>
                            </form>
                        </div>
                      </>
                    )}
                </div>
            </div>
          </main>
        )}
      </div>
      <Footer onOpenLegalModal={handleOpenLegalModal} />

      {isModalOpen && (
        <TransactionFormModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            formType={currentFormType}
            onSubmit={handleTransactionSubmit}
            transactionToEdit={editingTransaction}
            transactions={transactions}
            stakeholders={stakeholders}
            capTable={capTableResult}
            projectCurrency={projectCurrency}
        />
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
        isExportDisabled={!activeProject}
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