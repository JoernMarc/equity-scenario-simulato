import * as XLSX from 'xlsx';
import type { Transaction, Stakeholder, Project, ParsedImportData, ShareClass, Shareholding, VestingSchedule, FoundingTransaction, FinancingRoundTransaction, UpdateShareClassTransaction } from '../types';
import { TransactionType } from '../types';

export const exportToExcel = (project: Project): void => {
    // 1. De-normalize data into flat structures
    const flatTransactions: any[] = [];
    const flatShareClasses: any[] = [];
    const flatShareholdings: any[] = [];
    const flatVestingSchedules: any[] = [];

    project.transactions.forEach(tx => {
        const baseTx = { ...tx };
        
        if (tx.type === TransactionType.FOUNDING) {
            delete (baseTx as any).shareClasses;
            delete (baseTx as any).shareholdings;
            delete (baseTx as any).vestingSchedules;

            tx.shareClasses.forEach(sc => flatShareClasses.push({ transaction_id: tx.id, ...sc }));
            tx.shareholdings.forEach(sh => flatShareholdings.push({ transaction_id: tx.id, ...sh }));
            if(tx.vestingSchedules) {
                tx.vestingSchedules.forEach(vs => flatVestingSchedules.push({ transaction_id: tx.id, ...vs }));
            }
        } else if (tx.type === TransactionType.FINANCING_ROUND) {
            delete (baseTx as any).newShareClass;
            delete (baseTx as any).newShareholdings;
            (baseTx as any).convertsLoanIds = (tx.convertsLoanIds || []).join(',');

            flatShareClasses.push({ transaction_id: tx.id, ...tx.newShareClass });
            tx.newShareholdings.forEach(sh => flatShareholdings.push({ transaction_id: tx.id, ...sh }));
        } else if (tx.type === TransactionType.UPDATE_SHARE_CLASS) {
            (baseTx as any).updatedProperties = JSON.stringify(tx.updatedProperties);
        }

        flatTransactions.push(baseTx);
    });

    // 2. Create worksheets
    const transactionsSheet = XLSX.utils.json_to_sheet(flatTransactions);
    const stakeholdersSheet = XLSX.utils.json_to_sheet(project.stakeholders);
    const shareClassesSheet = XLSX.utils.json_to_sheet(flatShareClasses);
    const shareholdingsSheet = XLSX.utils.json_to_sheet(flatShareholdings);
    const vestingSchedulesSheet = XLSX.utils.json_to_sheet(flatVestingSchedules);

    // 3. Create workbook and append sheets
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, transactionsSheet, "Transactions");
    XLSX.utils.book_append_sheet(wb, stakeholdersSheet, "Stakeholders");
    XLSX.utils.book_append_sheet(wb, shareClassesSheet, "ShareClasses");
    XLSX.utils.book_append_sheet(wb, shareholdingsSheet, "Shareholdings");
    XLSX.utils.book_append_sheet(wb, vestingSchedulesSheet, "VestingSchedules");

    // 4. Write file
    XLSX.writeFile(wb, `${project.name.replace(/\s/g, '_')}_export.xlsx`);
};

const safeParseJson = (jsonString: any, fallback: any = {}) => {
  if (typeof jsonString !== 'string') return jsonString; // Already an object
  try {
    return JSON.parse(jsonString);
  } catch (e) {
    console.warn("Failed to parse JSON string from Excel:", jsonString);
    return fallback;
  }
}


export const parseExcelImport = async (file: File): Promise<ParsedImportData> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // 1. Read all sheets, providing empty arrays for missing ones
    const transactionsData = workbook.Sheets['Transactions'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Transactions']) : [];
    const stakeholdersData = workbook.Sheets['Stakeholders'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Stakeholders']) as Stakeholder[] : [];
    const shareClassesData = workbook.Sheets['ShareClasses'] ? XLSX.utils.sheet_to_json(workbook.Sheets['ShareClasses']) as any[] : [];
    const shareholdingsData = workbook.Sheets['Shareholdings'] ? XLSX.utils.sheet_to_json(workbook.Sheets['Shareholdings']) as any[] : [];
    const vestingSchedulesData = workbook.Sheets['VestingSchedules'] ? XLSX.utils.sheet_to_json(workbook.Sheets['VestingSchedules']) as any[] : [];

    if (transactionsData.length === 0) {
        throw new Error("Sheet 'Transactions' is empty or not found.");
    }
    
    // 2. Group related data by transaction_id for easy lookup
    const shareClassesByTxId = shareClassesData.reduce((acc, sc) => {
        (acc[sc.transaction_id] = acc[sc.transaction_id] || []).push(sc);
        return acc;
    }, {} as Record<string, ShareClass[]>);

    const shareholdingsByTxId = shareholdingsData.reduce((acc, sh) => {
        (acc[sh.transaction_id] = acc[sh.transaction_id] || []).push(sh);
        return acc;
    }, {} as Record<string, Shareholding[]>);
    
    const vestingSchedulesByTxId = vestingSchedulesData.reduce((acc, vs) => {
        (acc[vs.transaction_id] = acc[vs.transaction_id] || []).push(vs);
        return acc;
    }, {} as Record<string, VestingSchedule[]>);


    // 3. Reconstruct the full transaction objects
    const reconstructedTransactions: Transaction[] = transactionsData.map((flatTx: any) => {
        const txId = flatTx.id;
        let transaction: Transaction = { ...flatTx } as Transaction;

        if (flatTx.type === TransactionType.FOUNDING) {
            (transaction as FoundingTransaction).shareClasses = shareClassesByTxId[txId] || [];
            (transaction as FoundingTransaction).shareholdings = shareholdingsByTxId[txId] || [];
            (transaction as FoundingTransaction).vestingSchedules = vestingSchedulesByTxId[txId] || [];
        } else if (flatTx.type === TransactionType.FINANCING_ROUND) {
            (transaction as FinancingRoundTransaction).newShareClass = (shareClassesByTxId[txId] || [{}])[0];
            (transaction as FinancingRoundTransaction).newShareholdings = shareholdingsByTxId[txId] || [];
            if (typeof flatTx.convertsLoanIds === 'string' && flatTx.convertsLoanIds) {
                (transaction as FinancingRoundTransaction).convertsLoanIds = flatTx.convertsLoanIds.split(',');
            } else {
                 (transaction as FinancingRoundTransaction).convertsLoanIds = [];
            }
        } else if (flatTx.type === TransactionType.UPDATE_SHARE_CLASS) {
            (transaction as UpdateShareClassTransaction).updatedProperties = safeParseJson(flatTx.updatedProperties, {});
        }
        
        // Ensure numbers are numbers
        ['amount', 'interestRate', 'valuationCap', 'discount', 'fixedConversionPrice', 'ratioShares', 'ratioAmount', 'preMoneyValuation', 'purchasedShares', 'pricePerShare', 'equalizationInterestRate', 'numberOfShares'].forEach(key => {
            if (flatTx[key] !== undefined && typeof flatTx[key] === 'string') {
                (transaction as any)[key] = parseFloat(flatTx[key]);
            }
        });

        return transaction;
    });

    return {
        projectName: file.name.replace(/\.(xlsx|xls)$/, ''),
        transactions: reconstructedTransactions,
        stakeholders: stakeholdersData
    };
};