import * as XLSX from 'xlsx';
import type { Transaction, Stakeholder, Project, ParsedImportData } from '../types';
import { TransactionType } from '../types';

export const exportToExcel = (project: Project): void => {
    const transactionsSheet = XLSX.utils.json_to_sheet(project.transactions.map(tx => {
        // Flatten complex objects for Excel
        const flatTx: any = {...tx};
        if (tx.type === TransactionType.FOUNDING) {
            flatTx.shareClasses = JSON.stringify(tx.shareClasses);
            flatTx.shareholdings = JSON.stringify(tx.shareholdings);
            flatTx.vestingSchedules = JSON.stringify(tx.vestingSchedules);
        } else if (tx.type === TransactionType.FINANCING_ROUND) {
            flatTx.newShareClass = JSON.stringify(tx.newShareClass);
            flatTx.newShareholdings = JSON.stringify(tx.newShareholdings);
            flatTx.convertsLoanIds = (tx.convertsLoanIds || []).join(',');
        }
        return flatTx;
    }));
    const stakeholdersSheet = XLSX.utils.json_to_sheet(project.stakeholders);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, transactionsSheet, "Transactions");
    XLSX.utils.book_append_sheet(wb, stakeholdersSheet, "Stakeholders");

    // Simplified export, the docs mention 4 sheets, but this is a start.
    XLSX.writeFile(wb, `${project.name.replace(/\s/g, '_')}_export.xlsx`);
};


export const parseExcelImport = async (file: File): Promise<ParsedImportData> => {
    const data = await file.arrayBuffer();
    const workbook = XLSX.read(data);

    // This is a simplified parser. A real one would need to handle the 4 sheets logic described in docs.
    const transactionsSheet = workbook.Sheets['Transactions'];
    if (!transactionsSheet) {
        throw new Error("Sheet 'Transactions' not found.");
    }
    const stakeholdersSheet = workbook.Sheets['Stakeholders'];
     if (!stakeholdersSheet) {
        throw new Error("Sheet 'Stakeholders' not found.");
    }

    const transactions = XLSX.utils.sheet_to_json(transactionsSheet) as Transaction[];
    const stakeholders = XLSX.utils.sheet_to_json(stakeholdersSheet) as Stakeholder[];
    
    // Basic validation
    if (!transactions || transactions.length === 0) {
        throw new Error("No transactions found in the sheet.");
    }

    return {
        projectName: file.name.replace(/\.(xlsx|xls)$/, ''),
        transactions,
        stakeholders
    };
};