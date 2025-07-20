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

import type { Language, Transaction, ConvertibleLoanTransaction, Shareholding, Stakeholder, WaterfallResult, TotalCapitalizationResult, TotalCapitalizationEntry, FinancingRoundTransaction, FoundingTransaction, ShareClass, BaseTransaction, VotingResult, SampleScenario, DebtInstrumentTransaction, FontSize, Theme, UpdateShareClassTransaction, ShareTransferTransaction, CapTable, EqualizationPurchaseTransaction, LegalTab, Project, ParsedImportData } from './types';
import { TransactionType, TransactionStatus, FONT_SIZES, THEMES } from './types';
import { translations } from './i18n';
import type { Translations } from './i18n';
import Header from './components/Header';
import TransactionList from './components/TransactionList';
import TransactionFormModal from './components/TransactionFormModal';
import PlusIcon from './styles/icons/PlusIcon';
import ConfirmDialog from './components/ConfirmDialog';
import { calculateCapTable, simulateWaterfall, calculateAccruedInterest, simulateVote } from './logic/calculations';
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


// --- STATE STRUCTURE ---
interface AppState {
  projects: Record<string, Project>;
  activeProjectId: string | null;
}

const APP_STATE_STORAGE_KEY = 'capTableAppState_v2';
const ACCESSIBILITY_STORAGE_KEY_PREFIX = 'capTableTheme_v2';

const activeFilter = (tx: Transaction) => tx.status === TransactionStatus.ACTIVE;

function App() {
  const [language, setLanguage] = useState<Language>('de');
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
  const t = useMemo(() => translations[language], [language]);
  const locale = useMemo(() => language === 'de' ? 'de-DE' : 'en-US', [language]);
  
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


  // --- TRANSACTION HANDLERS ---
  const handleOpenModal = useCallback((type: TransactionType) => {
    setCurrentFormType(type);
    setEditingTransaction(null);
    setIsModalOpen(true);
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

  const activeTransactions = useMemo(() => transactions.filter(activeFilter), [transactions]);

  const capTableResult = useMemo(() => {
    if (activeTransactions.length === 0) return null;
    return calculateCapTable(activeTransactions, simulationDate);
  }, [activeTransactions, simulationDate]);

  const totalCapitalizationResult = useMemo((): TotalCapitalizationResult | null => {
    if (!capTableResult || activeTransactions.length === 0) return null;

    const entries: TotalCapitalizationEntry[] = [];
    let totalValue = 0;
    let pricePerShare = 0;
    
    const relevantTransactions = activeTransactions.filter(tx => tx.date <= simulationDate);

    const lastFinancingRound = [...relevantTransactions].filter(tx => tx.type === TransactionType.FINANCING_ROUND).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0] as FinancingRoundTransaction | undefined;

    if (lastFinancingRound) {
        const capTableBeforeRound = calculateCapTable(relevantTransactions, lastFinancingRound.date, lastFinancingRound.id);
        if(capTableBeforeRound.totalShares > 0) pricePerShare = lastFinancingRound.preMoneyValuation / capTableBeforeRound.totalShares;
    } else {
        const foundingTransaction = relevantTransactions.find(tx => tx.type === TransactionType.FOUNDING) as FoundingTransaction | undefined;
        if (foundingTransaction && capTableResult.totalShares > 0) {
            const totalInvestment = capTableResult.entries.reduce((sum, entry) => sum + (entry.initialInvestment || 0), 0);
            pricePerShare = totalInvestment / capTableResult.totalShares;
        }
    }

    capTableResult.entries.forEach(entry => {
        const value = pricePerShare > 0 ? entry.shares * pricePerShare : entry.initialInvestment || 0;
        entries.push({ key: `equity-${entry.stakeholderId}-${entry.shareClassId}`, stakeholderName: entry.stakeholderName, instrumentName: entry.shareClassName, instrumentType: t.equity, amountOrShares: entry.shares.toLocaleString(locale), value: value });
        totalValue += value;
    });

    const convertedLoanIds = new Set<string>();
    relevantTransactions.forEach(tx => { if (tx.type === 'FINANCING_ROUND' && tx.convertsLoanIds) tx.convertsLoanIds.forEach(id => convertedLoanIds.add(id)); });

    const unconvertedLoans = relevantTransactions.filter(tx => tx.type === 'CONVERTIBLE_LOAN' && !convertedLoanIds.has(tx.id)) as ConvertibleLoanTransaction[];

    unconvertedLoans.forEach(loan => {
        const interest = calculateAccruedInterest(loan, capTableResult.asOfDate);
        const value = loan.amount + interest;
        entries.push({ key: `loan-${loan.id}`, stakeholderName: loan.investorName, instrumentName: `${t.convertibleLoan} (${loan.date})`, instrumentType: t.hybrid, amountOrShares: loan.amount.toLocaleString(locale, { style: 'currency', currency: projectCurrency }), value: value });
        totalValue += value;
    });

    const debtInstruments = relevantTransactions.filter(tx => tx.type === 'DEBT_INSTRUMENT') as DebtInstrumentTransaction[];
    debtInstruments.forEach(debt => {
        const interest = calculateAccruedInterest(debt, capTableResult.asOfDate);
        const value = debt.amount + interest;
        const seniorityKey = snakeToCamel(debt.seniority) as keyof Translations;
        entries.push({
            key: `debt-${debt.id}`,
            stakeholderName: debt.lenderName,
            instrumentName: `${t.debtInstrument} (${(t[seniorityKey] as string) || debt.seniority})`,
            instrumentType: t.debt,
            amountOrShares: debt.amount.toLocaleString(locale, { style: 'currency', currency: projectCurrency }),
            value: value
        });
        totalValue += value;
    });
    
    entries.sort((a,b) => b.value - a.value);
    return { entries, totalValue };
  }, [capTableResult, activeTransactions, t, locale, simulationDate, projectCurrency]);

  const filteredTransactions = useMemo(() => {
    if (!searchQuery) return transactions;
    const lowercasedQuery = searchQuery.toLowerCase();
    return transactions.filter(tx => {
        const checkHoldings = (holdings: Shareholding[]) => holdings.some(s => s.stakeholderName.toLowerCase().includes(lowercasedQuery));
        switch (tx.type) {
            case TransactionType.FOUNDING: return tx.companyName.toLowerCase().includes(lowercasedQuery) || checkHoldings(tx.shareholdings);
            case TransactionType.CONVERTIBLE_LOAN: return tx.investorName.toLowerCase().includes(lowercasedQuery);
            case TransactionType.FINANCING_ROUND: return tx.roundName.toLowerCase().includes(lowercasedQuery) || checkHoldings(tx.newShareholdings);
            case TransactionType.SHARE_TRANSFER: {
                const transferTx = tx as ShareTransferTransaction;
                const seller = stakeholders.find(s => s.id === transferTx.sellerStakeholderId);
                return transferTx.buyerStakeholderName.toLowerCase().includes(lowercasedQuery) || (seller ? seller.name.toLowerCase().includes(lowercasedQuery) : false);
            }
            case TransactionType.EQUALIZATION_PURCHASE: {
                return tx.newStakeholderName.toLowerCase().includes(lowercasedQuery);
            }
            case TransactionType.DEBT_INSTRUMENT: return tx.lenderName.toLowerCase().includes(lowercasedQuery);
            case TransactionType.UPDATE_SHARE_CLASS:
                return JSON.stringify(tx).toLowerCase().includes(lowercasedQuery);
            default: return false;
        }
    });
  }, [transactions, searchQuery, stakeholders]);
  
  // --- ACCESSIBILITY HANDLERS ---
  const handleIncreaseFontSize = useCallback(() => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex < FONT_SIZES.length - 1) {
      setFontSize(FONT_SIZES[currentIndex + 1]);
    }
  }, [fontSize]);

  const handleDecreaseFontSize = useCallback(() => {
    const currentIndex = FONT_SIZES.indexOf(fontSize);
    if (currentIndex > 0) {
      setFontSize(FONT_SIZES[currentIndex - 1]);
    }
  }, [fontSize]);
  
  // --- PRINT/EXPORT HANDLERS ---
  const handlePrint = (elementId: string) => {
    const elementToPrint = document.getElementById(elementId);
    if (!elementToPrint) return;

    // Temporarily add a class to the element for printing
    document.body.classList.add('printing');
    elementToPrint.classList.add('printable');

    window.print();

    // Clean up after printing
    elementToPrint.classList.remove('printable');
    document.body.classList.remove('printing');
  };

  const handleExport = async (elementId: string, fileName: string, format: 'png' | 'pdf') => {
    const element = document.getElementById(elementId);
    if (!element) return;

    const canvas = await html2canvas(element, { scale: 2, useCORS: true, logging: false });
    
    if (format === 'png') {
        const image = canvas.toDataURL('image/png', 1.0);
        const link = document.createElement('a');
        link.download = `${fileName}.png`;
        link.href = image;
        link.click();
    } else if (format === 'pdf') {
        const pdf = new jsPDF({
            orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
            unit: 'px',
            format: [canvas.width, canvas.height]
        });
        pdf.addImage(canvas.toDataURL('image/jpeg', 0.9), 'JPEG', 0, 0, canvas.width, canvas.height);
        pdf.save(`${fileName}.pdf`);
    }
  };


  // --- SIMULATION HANDLERS ---
  const handleSimulateWaterfall = () => {
    if (capTableResult && exitProceeds !== '') {
        const result = simulateWaterfall(capTableResult, activeTransactions, exitProceeds, transactionCosts || 0, language);
        setWaterfallResult(result);
    }
  };

  const handleSimulateVote = () => {
      if (capTableResult) {
          const result = simulateVote(capTableResult, activeTransactions);
          setVotingResult(result);
      }
  };
  
  // --- PROJECT MANAGEMENT HANDLERS ---
  const handleCreateProject = useCallback((projectName: string, initialData?: { transactions: Transaction[], stakeholders: Stakeholder[] }) => {
    const newProjectId = crypto.randomUUID();
    
    const projectToCreate: Project = {
        id: newProjectId,
        name: projectName,
        transactions: initialData?.transactions || [],
        stakeholders: initialData?.stakeholders || [],
    };
    
    setAppState(prev => ({
      ...prev,
      projects: {
        ...prev.projects,
        [newProjectId]: projectToCreate,
      }
    }));
    
    handleSelectProject(newProjectId);

    if (!initialData) {
        setPendingModalType(TransactionType.FOUNDING);
    }
  }, []);

  const handleSelectProject = useCallback((projectId: string) => {
    setAppState(prev => ({ ...prev, activeProjectId: projectId }));
  }, []);

  const handleGoToDashboard = useCallback(() => {
    setAppState(prev => ({ ...prev, activeProjectId: null }));
  }, []);
  
  const handleRenameProject = useCallback((projectId: string, newName: string) => {
    setAppState(prev => {
        const project = prev.projects[projectId];
        if (!project) return prev;
        const updatedProject = { ...project, name: newName };
        return {
            ...prev,
            projects: { ...prev.projects, [projectId]: updatedProject }
        }
    });
  }, []);

  const handleDeleteProjectRequest = useCallback((projectId: string) => {
    setConfirmType('project');
    setDeletingId(projectId);
    setIsConfirmOpen(true);
  }, []);
  
  const handleLoadSampleScenario = useCallback((scenarioData: SampleScenario['data']) => {
    const newProjectId = crypto.randomUUID();
    
    const projectNameWithTimestamp = `${scenarioData.projectName} (${new Date().toLocaleTimeString(locale, {hour: '2-digit', minute:'2-digit'})})`;
    
    setAppState(prev => {
      const clonedData = JSON.parse(JSON.stringify(scenarioData));
      
      return {
        ...prev,
        projects: {
          ...prev.projects,
          [newProjectId]: {
            id: newProjectId,
            name: projectNameWithTimestamp,
            transactions: clonedData.transactions,
            stakeholders: clonedData.stakeholders,
          }
        },
        activeProjectId: newProjectId, 
      };
    });
  }, [locale]);


  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentFormType(null);
    setEditingTransaction(null);
  }, []);

  const handleSaveTransaction = useCallback((transactionData: Transaction) => {
    if (!appState.activeProjectId) return;
    
    setAppState(prev => {
        const projectId = prev.activeProjectId!;
        const project = prev.projects[projectId];
        let updatedStakeholders = [...project.stakeholders];
        const transaction = { ...transactionData };

        const getOrCreateStakeholderId = (name: string): string => {
            if (!name) return '';
            const trimmedName = name.trim();
            let existing = updatedStakeholders.find(s => s.name.toLowerCase() === trimmedName.toLowerCase());
            if (existing) return existing.id;
            const newStakeholder: Stakeholder = { id: crypto.randomUUID(), name: trimmedName };
            updatedStakeholders.push(newStakeholder);
            return newStakeholder.id;
        };

        if (transaction.type === TransactionType.FOUNDING) {
            transaction.shareholdings.forEach(sh => { sh.stakeholderId = getOrCreateStakeholderId(sh.stakeholderName); });
        } else if (transaction.type === TransactionType.FINANCING_ROUND) {
            transaction.newShareholdings.forEach(sh => { sh.stakeholderId = getOrCreateStakeholderId(sh.stakeholderName); });
        } else if (transaction.type === TransactionType.CONVERTIBLE_LOAN) {
            transaction.stakeholderId = getOrCreateStakeholderId(transaction.investorName);
        } else if (transaction.type === TransactionType.SHARE_TRANSFER) {
            transaction.buyerStakeholderId = getOrCreateStakeholderId(transaction.buyerStakeholderName);
        } else if (transaction.type === TransactionType.EQUALIZATION_PURCHASE) {
            transaction.newStakeholderId = getOrCreateStakeholderId(transaction.newStakeholderName);
        } else if (transaction.type === TransactionType.DEBT_INSTRUMENT) {
            // Debt instruments don't create stakeholders in this model, but you could add if needed
        } else if (transaction.type === TransactionType.UPDATE_SHARE_CLASS) {
             // No stakeholder creation needed for this type
        }

        const existingIndex = project.transactions.findIndex(t => t.id === transaction.id);
        const updatedTransactions = [...project.transactions];
        if (existingIndex > -1) {
            updatedTransactions[existingIndex] = transaction;
        } else {
            updatedTransactions.push(transaction);
        }
        updatedTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const updatedProject = { ...project, transactions: updatedTransactions, stakeholders: updatedStakeholders };
        return { ...prev, projects: { ...prev.projects, [projectId]: updatedProject } };
    });

    handleCloseModal();
  }, [appState.activeProjectId, handleCloseModal]);
  
  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setCurrentFormType(transaction.type);
    setIsModalOpen(true);
  }, []);

  const handleDeleteTransactionRequest = useCallback((transactionId: string) => {
    setConfirmType('transaction');
    setDeletingId(transactionId);
    setIsConfirmOpen(true);
  }, []);
  
  const handleConfirmDelete = useCallback(() => {
    if (!deletingId || !confirmType) return;
    
    if (confirmType === 'transaction') {
        if (!appState.activeProjectId) return;
        setAppState(prev => {
            const projectId = prev.activeProjectId!;
            const project = prev.projects[projectId];
            const updatedTransactions = project.transactions.filter(t => t.id !== deletingId);
            const updatedProject = { ...project, transactions: updatedTransactions };
            return { ...prev, projects: { ...prev.projects, [projectId]: updatedProject }};
        });
    } else if (confirmType === 'project') {
        setAppState(prev => {
            const updatedProjects = { ...prev.projects };
            delete updatedProjects[deletingId];
            return {
                ...prev,
                projects: updatedProjects,
                activeProjectId: prev.activeProjectId === deletingId ? null : prev.activeProjectId,
            };
        });
    }

    setIsConfirmOpen(false);
    setDeletingId(null);
    setConfirmType(null);
  }, [deletingId, confirmType, appState.activeProjectId]);
  
  const handleCancelDelete = useCallback(() => {
    setIsConfirmOpen(false);
    setDeletingId(null);
    setConfirmType(null);
  }, []);
  
  // Effect to open modal after project creation
  useEffect(() => {
    if (activeProject && pendingModalType) {
        handleOpenModal(pendingModalType);
        setPendingModalType(null);
    }
  }, [activeProject, pendingModalType, handleOpenModal]);


  // --- IMPORT/EXPORT & LEGAL HANDLERS ---
  const handleOpenImportExportModal = () => setIsImportExportModalOpen(true);
  
  const handleOpenLegalModal = (initialTab: LegalTab = 'impressum') => {
    setLegalModalState({ isOpen: true, initialTab });
  };
  
  const handleCloseImportExportModal = useCallback(() => {
    setIsImportExportModalOpen(false);
    setParsedImportData(null);
    setImportError(null);
  }, []);
  
  const handleCloseLegalModal = useCallback(() => {
      setLegalModalState({ isOpen: false });
  }, []);

  const handleExportData = useCallback(() => {
    if (!activeProject) return;
    const dataToExport = { stakeholders: activeProject.stakeholders, transactions: activeProject.transactions };
    const jsonString = JSON.stringify(dataToExport, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `captable-export-${activeProject.name.replace(/\s/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [activeProject]);

  const handleExportExcelTemplate = useCallback(() => {
    if (!activeProject) return;
    try {
        exportToExcel(activeProject);
    } catch (error) {
        console.error("Failed to export Excel template", error);
    }
  }, [activeProject]);

  const handleFileSelectedForImport = useCallback(async (file: File) => {
    setImportError(null);
    setParsedImportData(null);
    if (!file) return;

    try {
        const data = await parseExcelImport(file);
        setParsedImportData(data);
    } catch (error: any) {
        console.error("Error parsing Excel file:", error);
        setImportError(error.message || 'An unknown error occurred.');
    }
  }, []);

  const handleConfirmImport = useCallback(() => {
    if (parsedImportData) {
        handleCreateProject(parsedImportData.projectName, { 
            transactions: parsedImportData.transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
            stakeholders: parsedImportData.stakeholders
        });
        handleCloseImportExportModal();
    }
  }, [parsedImportData, handleCreateProject, handleCloseImportExportModal]);

  const handleClearImportPreview = useCallback(() => {
    setParsedImportData(null);
    setImportError(null);
  }, []);

  const ActionButton = ({ onClick, disabled, children }: { onClick: React.MouseEventHandler<HTMLButtonElement>; disabled?: boolean; children: React.ReactNode }) => (
    <button onClick={onClick} disabled={disabled} className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-theme-on-interactive bg-theme-interactive rounded-md shadow-sm hover:bg-theme-interactive-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-interactive disabled:bg-theme-disabled disabled:cursor-not-allowed transition-colors">
      <PlusIcon className="w-4 h-4" />
      {children}
    </button>
  );

  const getConfirmMessage = () => {
    if (confirmType === 'project' && deletingId && appState.projects[deletingId]) {
        const projectName = appState.projects[deletingId]?.name || '';
        return t.confirmDeleteProjectMessage.replace('{projectName}', projectName);
    }
    return t.confirmDeleteMessage;
  };
  
  const modalTransactionFormRef = useRef<HTMLButtonElement>(null);
  const confirmDialogRef = useRef<HTMLButtonElement>(null);
  const importExportRef = useRef<HTMLButtonElement>(null);
  const legalModalTriggerRef = useRef<HTMLButtonElement>(null);


  return (
    <div className="flex flex-col min-h-screen bg-theme-background">
      <div className="flex-grow">
        <Header 
          language={language} 
          setLanguage={setLanguage} 
          translations={t} 
          onOpenImportExportModal={() => {
              importExportRef.current = document.activeElement as HTMLButtonElement;
              handleOpenImportExportModal();
          }}
          theme={theme}
          setTheme={setTheme}
          fontSize={fontSize}
          onIncreaseFontSize={handleIncreaseFontSize}
          onDecreaseFontSize={handleDecreaseFontSize}
        />
        
        {activeProject ? (
          <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-4">
                  <div>
                      <button onClick={handleGoToDashboard} className="text-sm text-theme-interactive hover:text-theme-interactive-hover mb-1">&larr; {t.backToDashboard}</button>
                      <h2 className="text-2xl font-bold text-theme-primary" title={t.activeProject}>{activeProject.name}</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.FOUNDING); }} disabled={hasFoundingTransaction}>{t.createFounding}</ActionButton>
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.CONVERTIBLE_LOAN); }} disabled={!hasFoundingTransaction}>{t.addConvertible}</ActionButton>
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.FINANCING_ROUND); }} disabled={!hasFoundingTransaction}>{t.addFinancingRound}</ActionButton>
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.SHARE_TRANSFER); }} disabled={!hasFoundingTransaction}>{t.addShareTransfer}</ActionButton>
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.EQUALIZATION_PURCHASE); }} disabled={!hasFoundingTransaction}>{t.addEqualizationPurchase}</ActionButton>
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.DEBT_INSTRUMENT); }} disabled={!hasFoundingTransaction}>{t.addDebtInstrument}</ActionButton>
                      <ActionButton onClick={(e) => { modalTransactionFormRef.current = e.currentTarget; handleOpenModal(TransactionType.UPDATE_SHARE_CLASS); }} disabled={!hasFoundingTransaction}>{t.updateShareClass}</ActionButton>
                  </div>
              </div>
              
              <div className="bg-theme-surface rounded-lg shadow-sm border border-theme-subtle p-4">
                <label htmlFor="simulationDate" className="block text-sm font-medium text-theme-secondary mb-1">{t.simulationDateLabel}</label>
                <input
                    type="date"
                    id="simulationDate"
                    value={simulationDate}
                    onChange={e => setSimulationDate(e.target.value)}
                    className="w-full md:w-auto px-3 py-2 bg-theme-surface border border-theme-strong rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 ring-theme-interactive"
                />
              </div>

              <section aria-labelledby="transaction-log-title">
                  <h3 id="transaction-log-title" className="text-xl font-bold text-theme-primary sr-only">{t.transactionLog}</h3>
                  <div className="mb-6">
                      <input type="search" placeholder={t.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full px-4 py-2 bg-theme-surface border border-theme-strong rounded-md shadow-sm focus:outline-none focus:ring-theme-interactive focus:border-theme-interactive" aria-label={t.searchPlaceholder} disabled={!hasFoundingTransaction}/>
                  </div>
                  <TransactionList 
                    transactions={filteredTransactions} 
                    allTransactions={transactions} 
                    stakeholders={stakeholders}
                    translations={t} 
                    language={language} 
                    onEdit={(tx) => { modalTransactionFormRef.current = document.activeElement as HTMLButtonElement; handleEditTransaction(tx);}} 
                    onDelete={(id) => { confirmDialogRef.current = document.activeElement as HTMLButtonElement; handleDeleteTransactionRequest(id);}} 
                    isFoundingDeletable={isFoundingDeletable} 
                    searchQuery={searchQuery}
                    simulationDate={simulationDate}
                    projectCurrency={projectCurrency}
                  />
              </section>

              <section aria-labelledby="results-display-title">
                  <h3 id="results-display-title" className="text-2xl font-bold text-theme-primary mb-4 sr-only">{t.resultsDisplay}</h3>
                  <div className="space-y-8" aria-live="polite">
                      <CapTableView 
                        containerId="cap-table-view"
                        capTable={capTableResult} 
                        translations={t} 
                        language={language}
                        onPrint={() => handlePrint('cap-table-view')}
                        onExport={(format) => handleExport('cap-table-view', 'Cap-Table', format)}
                      />
                      <TotalCapitalizationView 
                        containerId="total-cap-view"
                        result={totalCapitalizationResult} 
                        translations={t} 
                        language={language} 
                        projectCurrency={projectCurrency}
                        onPrint={() => handlePrint('total-cap-view')}
                        onExport={(format) => handleExport('total-cap-view', 'Total-Capitalization', format)}
                      />
                  </div>
              </section>

              <section aria-labelledby="waterfall-simulation-inputs-title">
                  <div className="bg-theme-surface rounded-lg shadow-sm border border-theme-subtle p-6 space-y-6">
                      <h3 id="waterfall-simulation-inputs-title" className="text-lg font-semibold text-theme-primary">{t.waterfallSimulationTitle}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                          <div className="md:col-span-1">
                              <label htmlFor="exitProceeds" className="block text-sm font-medium text-theme-secondary">{t.exitProceeds}</label>
                              <div className="relative mt-1">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-theme-secondary sm:text-sm">{new Intl.NumberFormat(locale, { style: 'currency', currency: projectCurrency, currencyDisplay: 'narrowSymbol' }).format(0).replace(/[0-9.,]/g, '').trim()}</span></div>
                                  <input type="number" id="exitProceeds" value={exitProceeds} onChange={e => setExitProceeds(e.target.value === '' ? '' : parseFloat(e.target.value))} className="block w-full rounded-md border-theme-strong bg-theme-surface pl-7 pr-3 py-2 shadow-sm focus:border-theme-interactive focus:ring-theme-interactive sm:text-sm text-right" placeholder="10000000" disabled={!capTableResult}/>
                              </div>
                          </div>
                          <div className="md:col-span-1">
                              <label htmlFor="transactionCosts" className="block text-sm font-medium text-theme-secondary">{t.transactionCosts}</label>
                              <div className="relative mt-1">
                                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><span className="text-theme-secondary sm:text-sm">{new Intl.NumberFormat(locale, { style: 'currency', currency: projectCurrency, currencyDisplay: 'narrowSymbol' }).format(0).replace(/[0-9.,]/g, '').trim()}</span></div>
                                  <input type="number" id="transactionCosts" value={transactionCosts} onChange={e => setTransactionCosts(e.target.value === '' ? '' : parseFloat(e.target.value))} className="block w-full rounded-md border-theme-strong bg-theme-surface pl-7 pr-3 py-2 shadow-sm focus:border-theme-interactive focus:ring-theme-interactive sm:text-sm text-right" placeholder="50000" disabled={!capTableResult}/>
                              </div>
                          </div>
                          <div className="md:col-span-1">
                              <button onClick={handleSimulateWaterfall} disabled={!capTableResult || exitProceeds === ''} className="w-full px-4 py-2 bg-theme-interactive text-theme-on-interactive rounded-md hover:bg-theme-interactive-hover disabled:bg-theme-disabled disabled:cursor-not-allowed">{t.simulateWaterfall}</button>
                          </div>
                      </div>
                  </div>
                  <div className="aria-live-polite mt-8">
                    <WaterfallView 
                      containerId="waterfall-view"
                      result={waterfallResult} 
                      translations={t} 
                      language={language}
                      projectCurrency={projectCurrency}
                      onPrint={() => handlePrint('waterfall-view')}
                      onExport={(format) => handleExport('waterfall-view', 'Waterfall-Results', format)}
                    />
                  </div>
              </section>
              
              <section aria-labelledby="voting-simulation-inputs-title">
                 <div className="bg-theme-surface rounded-lg shadow-sm border border-theme-subtle p-6 space-y-6">
                    <h2 id="voting-simulation-inputs-title" className="text-lg font-semibold text-theme-primary">{t.votingSimulationTitle}</h2>
                      <div className="flex justify-center">
                          <button onClick={handleSimulateVote} disabled={!capTableResult} className="px-6 py-3 bg-theme-interactive text-theme-on-interactive rounded-md hover:bg-theme-interactive-hover disabled:bg-theme-disabled disabled:cursor-not-allowed">{t.simulateVote}</button>
                      </div>
                  </div>
                  <div className="aria-live-polite mt-8">
                    <VotingView 
                      containerId="voting-view"
                      result={votingResult} 
                      translations={t} 
                      language={language}
                      onPrint={() => handlePrint('voting-view')}
                      onExport={(format) => handleExport('voting-view', 'Voting-Results', format)}
                    />
                  </div>
              </section>
          </main>
        ) : (
          <ProjectDashboard 
              projects={Object.values(appState.projects)}
              onCreateProject={handleCreateProject}
              onSelectProject={handleSelectProject}
              onRenameProject={handleRenameProject}
              onDeleteProject={(id) => {
                  confirmDialogRef.current = document.activeElement as HTMLButtonElement;
                  handleDeleteProjectRequest(id);
              }}
              onLoadScenario={handleLoadSampleScenario}
              translations={t}
          />
        )}
      </div>

      <Footer onOpenLegalModal={(initialTab) => {
          legalModalTriggerRef.current = document.activeElement as HTMLButtonElement;
          handleOpenLegalModal(initialTab);
      }} translations={t} />

      {isModalOpen && (
          <TransactionFormModal 
            isOpen={isModalOpen}
            onClose={() => {
              handleCloseModal();
              modalTransactionFormRef.current?.focus();
            }}
            onSubmit={handleSaveTransaction}
            formType={currentFormType}
            translations={t}
            language={language}
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
        onCancel={() => {
          handleCancelDelete();
          confirmDialogRef.current?.focus();
        }}
        translations={t}
        title={confirmType === 'project' ? t.confirmDeleteProjectTitle : t.confirmDelete}
        message={getConfirmMessage()}
      />

      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => {
            handleCloseImportExportModal();
            importExportRef.current?.focus();
        }}
        onExport={handleExportData}
        onExportExcelTemplate={handleExportExcelTemplate}
        onImport={handleFileSelectedForImport}
        translations={t}
        parsedImportData={parsedImportData}
        importError={importError}
        onConfirmImport={handleConfirmImport}
        onClearImportPreview={handleClearImportPreview}
        isExportDisabled={!activeProject}
      />
      
      <LegalModal
        isOpen={legalModalState.isOpen}
        onClose={() => {
            handleCloseLegalModal();
            legalModalTriggerRef.current?.focus();
        }}
        translations={t}
        initialTab={legalModalState.initialTab}
      />
    </div>
  );

}

export default App;