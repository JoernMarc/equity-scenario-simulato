

export const translations = {
  en: {
    appTitle: "Equity Scenario Simulator",
    companyDetails: "Company Details",
    transactionLog: "Transaction Log",
    resultsDisplay: "Results Display",
    resultsPlaceholder: "Calculate the Cap Table to see the results.",
    noTransactions: "No transactions added yet. Start by creating a company.",
    addTransaction: "Add Transaction",
    createFounding: "Create Company",
    addConvertible: "Add Convertible",
    addFinancingRound: "Add Financing Round",
    addShareTransfer: "Add Share Transfer",
    addDebtInstrument: "Add Debt",
    updateShareClass: "Update Share Class",
    addEqualizationPurchase: "Add Equalization Purchase",
    editEqualizationPurchase: "Edit Equalization Purchase",
    equalizationPurchase: "Equalization Purchase",
    transactionType: "Transaction Type",
    date: "Date",
    companyName: "Company Name",
    legalForm: "Legal Form",
    currency: "Currency",
    currencyPlaceholder: "e.g. EUR, USD",
    shareholders: "Shareholders",
    shareholderName: "Shareholder Name",
    shareClass: "Share Class",
    numberOfShares: "Number of Shares",
    addShareholder: "Add Shareholder",
    investorName: "Investor Name",
    investmentAmount: "Investment Amount",
    valuationCap: "Valuation Cap",
    discount: "Discount (%)",
    optional: "optional",
    preMoneyValuation: "Pre-Money Valuation",
    newInvestors: "New Investors",
    addInvestor: "Add Investor",
    save: "Save",
    cancel: "Cancel",
    remove: "Remove",
    founding: "Founding",
    convertibleLoan: "Convertible Instrument",
    financingRound: "Financing Round",
    shareTransfer: "Share Transfer",
    debtInstrument: "Debt Instrument",
    roundName: "Round Name (e.g. Series A)",
    totalInvestment: "Total Investment",
    shares: "Shares",
    investment: "Investment",
    investors: "Investors",
    edit: "Edit",
    delete: "Delete",
    update: "Update",
    editFounding: "Edit Company Founding",
    editConvertible: "Edit Convertible Instrument",
    editFinancingRound: "Edit Financing Round",
    editShareTransfer: "Edit Share Transfer",
    editDebtInstrument: "Edit Debt Instrument",
    editUpdateShareClass: "Edit Share Class Update",
    confirmDelete: "Confirm Deletion",
    confirmDeleteMessage: "Are you sure you want to delete this transaction? This action cannot be undone.",
    deleteDisabledTooltip: "Cannot delete founding transaction while other transactions exist.",
    postMoneyValuation: "Post-Money Valuation",
    pricePerShare: "Price per Share",
    perShare: "per share",
    searchPlaceholder: "Search by company, investor, shareholder...",
    noSearchResults: "No transactions match your search.",
    status: "Status",
    validFrom: "Valid From",
    validTo: "Valid To",
    used: "In Use",
    draft: "Draft",
    active: "Active",
    archived: "Archived",
    statusAndValidity: "Status & Validity",

    // New detailed fields
    shareClassDefinition: "Share Class Definition",
    shareClassName: "Share Class Name",
    liquidationPreference: "Liquidation Preference",
    liquidationPreferenceRank: "Rank",
    liquidationPreferenceFactor: "Factor (e.g., 1.5 for 1.5x)",
    liquidationPreferenceType: "Type",
    nonParticipating: "Non-Participating",
    fullParticipating: "Full Participating",
    cappedParticipating: "Capped Participating",
    participationCapFactor: "Participation Cap Factor (e.g., 3 for 3x)",
    antiDilutionProtection: "Anti-Dilution Protection",
    none: "None",
    broadBased: "Broad-based",
    narrowBased: "Narrow-based",
    fullRatchet: "Full Ratchet",
    interestRate: "Interest Rate (% p.a.)",
    convertedLoans: "Converted Loans",
    selectLoansToConvert: "Select loans to convert",
    initialShareClasses: "Initial Share Classes",
    addShareClass: "Add Share Class",
    shareholdings: "Shareholdings",
    stakeholderName: "Stakeholder Name",
    addShareholding: "Add Shareholding",
    noConvertibleLoans: "No convertible loans available to convert.",
    newShareClassDetails: "New Share Class Details",
    investmentRoundDetails: "Investment Round Details",
    votesPerShare: "Votes per Share",
    protectiveProvisions: "Protective Provisions (comma-separated)",

    // Update Share Class
    shareClassToUpdate: "Share Class to Update",
    selectShareClassToUpdate: "Select share class to update",
    updatedProperties: "Updated Properties",
    noPropertiesChanged: "No properties were changed.",
    oldValue: "Old",
    newValue: "New",

    // Vesting
    vestingSchedules: "Vesting Schedules",
    addVestingSchedule: "Add Vesting Schedule",
    scheduleName: "Schedule Name",
    grantDate: "Grant Date",
    vestingPeriodMonths: "Vesting Period (Months)",
    cliffMonths: "Cliff (Months)",
    assignVestingSchedule: "Assign Vesting Schedule",
    noVesting: "No Vesting",

    // Share Transfer
    transferDetails: "Transfer Details",
    seller: "Seller",
    selectSeller: "Select Seller",
    buyer: "Buyer",
    shareClassToTransfer: "Share Class to Transfer",
    selectShareClass: "Select Share Class",
    sharesOwned: "Shares Owned",
    additionalPayment: "Additional Payment",
    paymentDescription: "Payment Description",

    // Debt
    lenderName: "Lender Name",
    seniority: "Seniority",
    seniorSecured: "Senior Secured",
    seniorUnsecured: "Senior Unsecured",
    subordinated: "Subordinated",
    debtDetails: "Debt Details",

    // Equalization Purchase
    purchaseDetails: "Purchase Details",
    equalizationDetails: "Equalization Details",
    purchasedShares: "Purchased Shares",
    selectShareClassToPurchase: "Select share class to purchase",
    equalizationInterestRate: "Equalization Interest Rate (% p.a.)",
    referenceTransaction: "Reference Transaction",
    selectReferenceTransaction: "Select Reference Transaction",
    newStakeholderName: "New Stakeholder Name",

    // New validation messages
    requiredShareCapital: "Required Share Capital",
    shareCapitalRequirementWarning: "Note: The total investment is less than the typical required share capital of {amount}. The check is only performed if the project currency matches the legal form's currency.",
    
    // Cap Table Calculation
    asOfDate: "As of Date",
    capTableTitle: "Capitalization Table",
    stakeholder: "Stakeholder",
    percentage: "Percentage",
    totalIssuedShares: "Total Issued Shares",
    vestedShares: "Vested Shares",
    unvestedShares: "Unvested Shares",
    noCapTable: "Calculate the Cap Table to see the results.",

    // Waterfall Simulation
    waterfallSimulationTitle: "Waterfall Simulation",
    exitProceeds: "Exit Proceeds",
    transactionCosts: "Transaction Costs",
    simulateWaterfall: "Simulate Waterfall",
    waterfallResultsTitle: "Waterfall Distribution Results ({currency})",
    initialInvestment: "Initial Inv.",
    fromDebtRepayment: "From Debt",
    fromLiquidationPreference: "From Pref.",
    fromParticipation: "From Partic.",
    fromConvertedShares: "From Conv. / Common",
    totalProceeds: "Total Proceeds",
    multiple: "Multiple (x)",
    netExitProceeds: "Net Exit Proceeds",
    remainingValue: "Remaining Value",
    noWaterfallYet: "Enter exit proceeds and run the simulation.",
    calculationSteps: "Calculation Steps",
    showCalculationSteps: "Show Calculation Steps",
    hideCalculationSteps: "Hide Calculation Steps",

    // Total Capitalization
    totalCapitalizationTitle: "Total Capitalization Overview ({currency})",
    instrument: "Instrument",
    instrumentType: "Type",
    amountOrShares: "Amount / Shares",
    value: "Value ({currency})",
    equity: "Equity",
    hybrid: "Hybrid",
    debt: "Debt",

    // Voting Simulation
    votingSimulationTitle: "Voting Power Simulation",
    simulateVote: "Simulate Vote",
    votingResultsTitle: "Voting Power Distribution",
    votes: "Votes",
    totalVotes: "Total Votes",
    noVoteYet: "Simulate the vote to see the distribution.",

    // Print & Export Results
    print: "Print",
    export: "Export",
    exportAsPng: "Export as PNG",
    exportAsPdf: "Export as PDF",

    // Import / Export
    importExport: "Import / Export",
    importExportTitle: "Import & Export Data",
    exportToJson: "Export to JSON (Backup)",
    exportDescription: "Download the active project's data in a technical JSON format.",
    exportAsExcelTemplate: "Export as Excel Template",
    exportAsExcelTemplateDescription: "Download the active project's data in a user-friendly Excel file for editing and re-import.",
    importFromExcel: "Import from Excel",
    importDescription: "Upload an Excel file to create a new project. Use the exported template as a starting point.",
    importInstructionsTitle: "User-Friendly Excel Structure (4 Sheets):",
    importSheetTransactions: "Sheet 'Transactions': Main list of events. Each row must have a unique 'transactionName'. For financing rounds, use the 'convertsLoanTransactionNames' column to specify which loans to convert.",
    importSheetStakeholders: "Sheet 'Stakeholders': List all unique people/entities. Each must have a unique, user-defined 'stakeholderId' to avoid issues with duplicate names.",
    importSheetShareClasses: "Sheet 'ShareClasses': Defines each share class, linked via 'transactionName'.",
    importSheetShareholdings: "Sheet 'Shareholdings': Links everything using 'transactionName', 'stakeholderId', and 'shareClassName'.",
    dropFileHere: "Drop Excel file here, or click to select",
    importSuccess: "Data imported successfully!",
    importError: "Import Failed",
    importSpecificError: "Import failed: {error}",
    importPreviewTitle: "Import Preview",
    importDataFound: "Project '{projectName}' found with {countTransactions} transactions and {countStakeholders} stakeholders.",
    confirmImport: "Create Project",
    tryAgain: "Try Again",
    importPreviewWarning: "Confirming will create a new project with this data.",

    // Project Management
    projectsDashboard: "Projects Dashboard",
    createNewProject: "Create New Project",
    projectName: "Project Name",
    enterProjectName: "Enter project name...",
    create: "Create",
    selectProject: "Select Project",
    noProjects: "No projects yet. Create one to get started!",
    backToDashboard: "Back to Dashboard",
    confirmDeleteProjectTitle: "Delete Project?",
    confirmDeleteProjectMessage: "Are you sure you want to delete the project '{projectName}'? This is permanent and cannot be undone.",
    renameProject: "Rename Project",
    activeProject: "Active Project",
    projectDashboardHintTitle: "New? Start Here!",
    projectDashboardHintText: "To explore the app's features without manual data entry, try loading one of the sample scenarios below. They provide a quick and easy way to see the tool in action.",
    
    // Convertible Loan Mechanisms
    conversionMechanism: "Conversion Mechanism",
    capAndDiscount: "Cap & Discount",
    fixedPrice: "Fixed Price",
    fixedRatio: "Fixed Ratio",
    fixedConversionPrice: "Fixed Conversion Price ({currency} / Share)",
    ratioShares: "Shares",
    forAmount: "for Amount ({currency})",

    // Help Tooltips
    help: {
      currency: "Enter the 3-letter ISO code for the project's primary currency (e.g., EUR, USD). This will be used for all financial displays throughout the application.",
      preMoneyValuation: "The value of the company before new money is invested in a financing round.",
      valuationCap: "A ceiling on the valuation at which a convertible instrument converts into equity. The investor gets the better deal of either the valuation cap or the discount.",
      discount: "A percentage reduction on the price per share of the financing round, at which the convertible instrument converts.",
      liquidationPreferenceType: "NON_PARTICIPATING: Gets preference or converts to common stock (chooses better). FULL_PARTICIPATING: Gets preference AND participates with common stock. CAPPED_PARTICIPATING: Gets preference and participates until a total return cap is met.",
      participationCapFactor: "For 'Capped Participating' preference, this is the total return multiple (e.g., 3x) an investor can receive. Includes the initial preference.",
      antiDilutionProtection: "Protects earlier investors from dilution if a future financing round happens at a lower valuation ('down round'). 'Full Ratchet' is the strongest form.",
      vestingCliff: "A period at the beginning of a vesting schedule during which no shares are vested. If employment terminates before the cliff, no shares are granted.",
      shareTransfer: "Models a 'Secondary Transaction' where an existing stakeholder sells their shares to another (new or existing) stakeholder. This transaction reassigns ownership without issuing new shares from the company treasury.",
      vestingSchedules: "Vesting schedules define how ownership of shares is earned over time, typically for founders and employees, to ensure long-term commitment. A schedule includes a total vesting period (e.g., 48 months) and often a 'cliff' (e.g., 12 months). No shares are vested before the cliff is met. After the cliff, a portion vests, and the rest typically vests monthly. Vested shares determine ownership in calculations like voting power and waterfall simulations.",
      shareholdings: "List all initial shareholders, their number of shares, and any initial cash investment. The 'price per share' is calculated automatically from investment and shares. You can assign a vesting schedule to a shareholding, which is common for founders or employees.",
      initialShareClasses: "Define the initial types of shares for the company. At founding, this is typically 'Common Stock' with 1 vote per share and no special preferences. More complex share classes are usually introduced in later financing rounds.",
      convertibleLoan: "A convertible loan (or note) is a form of short-term debt that converts into equity, typically during a future financing round. It's a common way for seed-stage companies to raise capital quickly. Select the conversion mechanism that matches your term sheet.",
      conversionMechanism: "Defines how the loan converts into equity. 'Cap & Discount' is typical for VC deals. 'Fixed Price' uses a predefined price per share. 'Fixed Ratio' defines a set number of shares per invested amount.",
      fixedPrice: "The loan converts into shares at this exact price per share, regardless of the valuation in the financing round.",
      fixedRatio: "The loan converts based on a defined ratio. For example, '1 Share for Amount 1000' means the investor receives one share for every invested amount of the project's currency.",
      financingRoundDetails: "Enter the core financial details of the round. The Pre-Money Valuation is the company's value *before* this new investment. The price per share for new investors is calculated based on this valuation and the number of shares outstanding before the round.",
      newShareClassDetailsFinancing: "Define the new class of shares being issued to investors in this round (e.g., 'Series A Preferred'). These shares often come with with special rights like liquidation preferences (getting paid back first in an exit), anti-dilution protection (protection from future 'down-rounds'), and different voting rights.",
      newInvestors: "List the new investors participating in this round and their respective cash investment amounts. The number of shares they receive is calculated automatically based on the price per share determined by the pre-money valuation.",
      convertedLoans: "Select any existing convertible loans that will convert into equity in this financing round. The loan amount plus accrued interest will be converted into shares of the new share class, based on the loan's specific valuation cap and discount terms.",
      debtInstrument: "Record non-convertible debt, such as bank loans. The seniority ('Senior Secured', 'Senior Unsecured', 'Subordinated') is critical as it determines the repayment order in a liquidation event, before any equity holders receive proceeds.",
      updateShareClass: "This transaction allows you to change the properties of an existing share class from a specific date forward. For example, you could increase the votes per share or alter the liquidation preference terms. This is a powerful but less common transaction that can significantly alter the capital structure.",
      equalizationPurchase: "Models a transaction where a new investor buys into the company at a later stage but wants to be treated economically as if they had invested earlier. This is achieved by paying the original share price plus a calculated interest amount to 'equalize' their entry.",
      purchaseDetails: "The core details of the share purchase. This is similar to a secondary transaction but includes an equalization component.",
      equalizationDetails: "Defines the interest calculation to equalize this investment with an earlier one. Select the transaction (e.g., a previous financing round) to which this purchase should be back-dated for interest calculation purposes.",
      equalizationInterestRate: "The annual interest rate used to calculate the additional payment required to 'equalize' this late entry with an earlier investment."
    },

    // User Guide
    userGuideTitle: "User Guide & Sample Scenarios",
    showGuide: "Show Guide & Examples",
    hideGuide: "Hide Guide & Examples",
    tabHowItWorks: "How it Works",
    tabUseCases: "Use Cases",
    tabSampleScenarios: "Sample Scenarios",
    howItWorks: {
      title: "How the Equity Scenario Simulator Works",
      intro: "This application helps you model and understand company equity. It works in three main stages: Data Entry, Calculation, and Simulation. All data stays on your device.",
      step1Title: "Step 1: Create a Project & Founding Transaction",
      step1Text: "Everything starts with a project. On the dashboard, create a new project. You will then be prompted to create the first transaction: the 'Founding'. Here, you define the company's initial share classes (e.g., Common Stock), who owns how many shares (the initial shareholders), and the project's primary currency.",
      step2Title: "Step 2: Add Chronological Transactions",
      step2Text: "Build the company's history by adding transactions in the order they occurred. Use the buttons at the top to add financing rounds, convertible loans, debt, or share transfers. Each transaction you add will update the company's capital structure from its date forward.",
      step3Title: "Step 3: Analyze the Cap Table",
      step3Text: "The Capitalization Table (Cap Table) shows who owns what percentage of the company at a specific point in time. Use the 'Simulation Date' selector to view the cap table at any date in the past or future. The table automatically includes all 'Active' transactions up to that date.",
      step4Title: "Step 4: Run Simulations",
      step4Text: "The real power of the tool lies in its simulations. The Waterfall Analysis shows how proceeds from a company sale would be distributed among all stakeholders, respecting debt seniority and liquidation preferences. The Voting Power simulation shows the distribution of voting rights based on vested shares."
    },
    loadScenario: "Load this scenario",
    sampleScenarios: "Sample Scenarios",
    useCases: {
        title: "Use Cases",
        goal: "Goal",
        features: "Features Used",
        uc01Title: "UC-01: Project & Portfolio Management",
        uc01Goal: "Manage multiple independent companies (clients, portfolio firms) without data mingling and securely save progress.",
        uc01Features: "Projects Dashboard, Local Storage",
        uc02Title: "UC-02: Initial Setup & Founder Vesting",
        uc02Goal: "Create a clean cap table after incorporation, including founder shares and vesting plans to model their long-term commitment.",
        uc02Features: "Founding Transaction, Vesting Schedules",
        uc03Title: "UC-03: Modeling Financing Rounds",
        uc03Goal: "Understand the impact of seed (convertible loans) and growth rounds (Series A/B) on the cap table, including conversion mechanisms.",
        uc03Features: "Convertible Loans (Cap/Discount), Financing Rounds",
        uc04Title: "UC-04: Down-Round Simulation",
        uc04Goal: "Quantify the protective effect of an 'Anti-Dilution' clause (e.g., Full Ratchet) in a financing round with a lower valuation.",
        uc04Features: "Anti-Dilution Protection",
        uc05Title: "UC-05: Comprehensive Exit Analysis (Waterfall)",
        uc05Goal: "Simulate how exit proceeds are distributed considering the entire capital structure (senior debt, convertibles, preferences).",
        uc05Features: "Waterfall Simulation, Debt Instruments, Seniority",
        uc06Title: "UC-06: Governance & Control Analysis",
        uc06Goal: "Track the historical evolution of voting rights after each transaction to understand when and how control shifted.",
        uc06Features: "Voting Power Simulation, Historical Analysis",
        uc07Title: "UC-07: Modeling Secondaries",
        uc07Goal: "Correctly reflect a share transfer between stakeholders (e.g., a founder selling shares to a new investor) in the cap table.",
        uc07Features: "Share Transfer Transaction",
        uc08Title: "UC-08: Efficient Data Management",
        uc08Goal: "Quickly and accurately import an existing, complex cap table from an Excel file or export a scenario as a backup.",
        uc08Features: "Excel Import, JSON Export",
        uc09Title: "UC-09: Onboarding & Learning",
        uc09Goal: "Understand complex clauses and learn the tool quickly using predefined example scenarios and context-sensitive help.",
        uc09Features: "User Guide, Tooltips, Sample Scenarios",
    },
    scenarioSeedRoundTitle: "Scenario 1: Typical Seed Round",
    scenarioSeedRoundDescription: "Demonstrates a company founding, a convertible loan from an angel investor, and a subsequent seed financing round that converts the loan. Includes a vesting schedule for one founder.",
    scenarioDownRoundTitle: "Scenario 2: Down-Round with Anti-Dilution",
    scenarioDownRoundDescription: "Shows the effect of a 'down-round' (a financing round at a lower valuation). A previous investor with 'Full Ratchet' anti-dilution protection receives additional shares to compensate.",
    scenarioAdvancedWaterfallTitle: "Scenario 3: Advanced Waterfall & Debt",
    scenarioAdvancedWaterfallDescription: "Demonstrates a waterfall simulation including senior and subordinated debt, showing the correct repayment hierarchy before equity distribution.",
    scenarioGovernanceTitle: "Scenario 4: Governance & Secondaries",
    scenarioGovernanceDescription: "Illustrates a share transfer (secondary) from a founder to a new investor, combined with an update to share class voting rights to create a super-majority.",
    
    // Workflow Diagram
    workflowTitle: "Company Lifecycle",
    workflowNodeFoundingTitle: "1. Founding",
    workflowNodeFoundingDesc: "Define founders, initial shares, and vesting schedules.",
    workflowNodeEarlyFinanceTitle: "2. Early-Stage Finance",
    workflowNodeEarlyFinanceDesc: "Raise capital with convertible loans or SAFEs before a priced round.",
    workflowNodeGrowthTitle: "3. Growth Financing",
    workflowNodeGrowthDesc: "Execute priced rounds (e.g., Series A, B) to scale the business.",
    workflowNodeOngoingTitle: "4. Ongoing Management",
    workflowNodeOngoingDesc: "Manage employee options (ESOP), secondaries, and other events.",
    workflowNodeExitTitle: "5. Exit / Liquidation",
    workflowNodeExitDesc: "Simulate the waterfall distribution from an acquisition or IPO.",
    workflowStartHere: "Start Here",

    // Date Filtering
    simulationDateLabel: "Simulation Date",
    futureTransaction: "Future",
    futureTransactionTooltip: "This transaction's date is after the simulation date and is not included in the current calculation.",
    
    // Accessibility
    accessibilityControls: "Accessibility",
    decreaseFontSize: "Decrease Font Size",
    increaseFontSize: "Increase Font Size",
    themeClassic: "Classic",
    themeModern: "Modern",
    themeContrast: "High Contrast",
    decreaseFontSizeTooltip: "Decrease Font Size",
    increaseFontSizeTooltip: "Increase Font Size",
    themeClassicTooltip: "Classic Theme",
    themeModernTooltip: "Modern Theme",
    themeContrastTooltip: "High Contrast Theme",

    // Legal & Footer
    footer: {
      legalNotice: "Legal Notice, Privacy & Disclaimer",
    },
    legal: {
      title: "Legal Information",
      tabImpressum: "Legal Notice",
      tabPrivacy: "Privacy Policy",
      tabDisclaimer: "Disclaimer & License",
      impressumTitle: "Legal Notice (Impressum)",
      impressumText: "Information according to § 5 TMG:\n\nJörn Densing\nAuf dem Köllenhof 81\n53343 Wachtberg\nGermany\n\nContact:\nPhone: +49 175 2425446\nEmail: kontakt@jodecon.de",
      privacyTitle: "Privacy Policy",
      privacyText: `
**1. General Principle**
This application is a purely client-side tool. This means all logic, calculations, and data storage happen directly within your web browser on your own computer.

**2. Data Storage and Security**
All data you enter is stored exclusively in your web browser's local storage (\`localStorage\`).
- **No Server Contact:** Your data is **never** sent to, or stored on, any external server. We have no access to your data.
- **Data remains on your device:** Your financial models are private and stay on your computer, under your control.

**3. Data Availability and Backup**
- **Device-Specific:** The data stored in \`localStorage\` is tied to the specific browser and device you are using. Data will **not** automatically sync between different computers or browsers.
- **User-Managed Backups:** To save a scenario or transfer it to another device, you can use the 'Export to JSON (Backup)' feature. As this application is provided without any guarantee of availability or support (see Disclaimer), the responsibility for saving any data you deem important lies solely with you.

**4. Deleting Your Data**
You have complete control over deleting your data through in-app functions or by clearing your browser's site data.

**5. Third-Party Services**
This application uses public Content Delivery Networks (CDNs) to load necessary libraries like Tailwind CSS and XLSX.js. This may involve your browser contacting these third-party servers to download these files.
`,
      disclaimerTitle: "Disclaimer & License",
      disclaimerText: `**Disclaimer and Limitation of Liability**
This application is provided as a free tool for simulation purposes on an "as is" basis. The results are based on the data you provide and do not constitute financial, legal, or tax advice.

Use of this tool is at your own risk. The operator assumes no liability whatsoever for the accuracy, completeness, or timeliness of the simulations, nor for any direct or indirect damages arising from the use of the application.

No support is provided for the application, and there is no guarantee of its long-term availability, functionality, or freedom from errors.

**Feedback**
I am grateful for any feedback or suggestions for improvement. Please send them to: kontakt@jodecon.de

**Copyright & License**
Copyright (c) 2025 Jörn Densing, Wachtberg (Deutschland)

All Rights Reserved.

Permission to use, copy, modify, and distribute this software and its
documentation for any purpose and without fee is hereby prohibited, 
without a written agreement with Jörn Densing, Wachtberg (Deutschland).
`,
    },
  },
  de: {
    appTitle: "Equity Scenario Simulator",
    companyDetails: "Unternehmensdaten",
    transactionLog: "Transaktions-Log",
    resultsDisplay: "Ergebnisanzeige",
    resultsPlaceholder: "Berechnen Sie die Cap Table, um die Ergebnisse zu sehen.",
    noTransactions: "Noch keine Transaktionen hinzugefügt. Beginnen Sie mit der Gründung eines Unternehmens.",
    addTransaction: "Transaktion hinzufügen",
    createFounding: "Unternehmen anlegen",
    addConvertible: "Wandelinstrument hinzufügen",
    addFinancingRound: "Finanzierungsrunde hinzufügen",
    addShareTransfer: "Anteilsübertragung hinzufügen",
    addDebtInstrument: "Darlehen hinzufügen",
    updateShareClass: "Anteilsklasse ändern",
    addEqualizationPurchase: "Ausgleichszahlung hinzufügen",
    editEqualizationPurchase: "Ausgleichszahlung bearbeiten",
    equalizationPurchase: "Ausgleichszahlung",
    transactionType: "Transaktionstyp",
    date: "Datum",
    companyName: "Firmenname",
    legalForm: "Rechtsform",
    currency: "Währung",
    currencyPlaceholder: "z.B. EUR, USD",
    shareholders: "Gesellschafter",
    shareholderName: "Name des Gesellschafters",
    shareClass: "Anteilsklasse",
    numberOfShares: "Anzahl Anteile",
    addShareholder: "Gesellschafter hinzufügen",
    investorName: "Name des Investors",
    investmentAmount: "Investitionssumme",
    valuationCap: "Bewertungsobergrenze",
    discount: "Discount (%)",
    optional: "optional",
    preMoneyValuation: "Pre-Money-Bewertung",
    newInvestors: "Neue Investoren",
    addInvestor: "Investor hinzufügen",
    save: "Speichern",
    cancel: "Abbrechen",
    remove: "Entfernen",
    founding: "Gründung",
    convertibleLoan: "Wandelinstrument",
    financingRound: "Finanzierungsrunde",
    shareTransfer: "Anteilsübertragung",
    debtInstrument: "Darlehen",
    roundName: "Rundenname (z.B. Series A)",
    totalInvestment: "Gesamtinvestment",
    shares: "Anteile",
    investment: "Investment",
    investors: "Investoren",
    edit: "Bearbeiten",
    delete: "Löschen",
    update: "Aktualisieren",
    editFounding: "Unternehmensgründung bearbeiten",
    editConvertible: "Wandelinstrument bearbeiten",
    editFinancingRound: "Finanzierungsrunde bearbeiten",
    editShareTransfer: "Anteilsübertragung bearbeiten",
    editDebtInstrument: "Darlehen bearbeiten",
    editUpdateShareClass: "Anteilsklassen-Änderung bearbeiten",
    confirmDelete: "Löschung bestätigen",
    confirmDeleteMessage: "Sind Sie sicher, dass Sie diese Transaktion löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.",
    deleteDisabledTooltip: "Die Gründungstransaktion kann nicht gelöscht werden, solange andere Transaktionen vorhanden sind.",
    postMoneyValuation: "Post-Money-Bewertung",
    pricePerShare: "Preis pro Anteil",
    perShare: "pro Anteil",
    searchPlaceholder: "Suche nach Firma, Investor, Gesellschafter...",
    noSearchResults: "Keine Transaktionen entsprechen Ihrer Suche.",
    status: "Status",
    validFrom: "Gültig von",
    validTo: "Gültig bis",
    used: "In Verwendung",
    draft: "Entwurf",
    active: "Aktiv",
    archived: "Archiviert",
    statusAndValidity: "Status & Gültigkeit",

    // New detailed fields
    shareClassDefinition: "Definition der Anteilsklasse",
    shareClassName: "Name der Anteilsklasse",
    liquidationPreference: "Liquidationspräferenz",
    liquidationPreferenceRank: "Rang",
    liquidationPreferenceFactor: "Faktor (z.B. 1.5 für 1.5x)",
    liquidationPreferenceType: "Art",
    nonParticipating: "Nicht-partizipierend",
    fullParticipating: "Voll partizipierend",
    cappedParticipating: "Partizipierend mit Cap",
    participationCapFactor: "Partizipations-Cap-Faktor (z.B. 3 für 3x)",
    antiDilutionProtection: "Verwässerungsschutz",
    none: "Keiner",
    broadBased: "Broad-based",
    narrowBased: "Narrow-based",
    fullRatchet: "Full Ratchet",
    interestRate: "Zinssatz (% p.a.)",
    convertedLoans: "Gewandelte Darlehen",
    selectLoansToConvert: "Zu wandelnde Darlehen auswählen",
    initialShareClasses: "Initiale Anteilsklassen",
    addShareClass: "Anteilsklasse hinzufügen",
    shareholdings: "Anteilsbesitz",
    stakeholderName: "Name des Anteilseigners",
    addShareholding: "Anteilsbesitz hinzufügen",
    noConvertibleLoans: "Keine wandelbaren Darlehen zur Umwandlung verfügbar.",
    newShareClassDetails: "Details der neuen Anteilsklasse",
    investmentRoundDetails: "Details der Investmentrunde",
    votesPerShare: "Stimmen pro Anteil",
    protectiveProvisions: "Sonderrechte (Komma-getrennt)",

    // Update Share Class
    shareClassToUpdate: "Zu ändernde Anteilsklasse",
    selectShareClassToUpdate: "Anteilsklasse zum Ändern auswählen",
    updatedProperties: "Geänderte Eigenschaften",
    noPropertiesChanged: "Es wurden keine Eigenschaften geändert.",
    oldValue: "Alt",
    newValue: "Neu",

    // Vesting
    vestingSchedules: "Vesting-Pläne",
    addVestingSchedule: "Vesting-Plan hinzufügen",
    scheduleName: "Name des Plans",
    grantDate: "Startdatum",
    vestingPeriodMonths: "Vesting-Periode (Monate)",
    cliffMonths: "Cliff (Monate)",
    assignVestingSchedule: "Vesting-Plan zuweisen",
    noVesting: "Kein Vesting",

    // Share Transfer
    transferDetails: "Details der Übertragung",
    seller: "Verkäufer",
    selectSeller: "Verkäufer auswählen",
    buyer: "Käufer",
    shareClassToTransfer: "Zu übertragende Anteilsklasse",
    selectShareClass: "Anteilsklasse auswählen",
    sharesOwned: "Anteile im Besitz",
    additionalPayment: "Zusätzliche Zahlung",
    paymentDescription: "Beschreibung der Zahlung",
    
    // Debt
    lenderName: "Kreditgeber",
    seniority: "Rang",
    seniorSecured: "Besichert (Senior)",
    seniorUnsecured: "Unbesichert (Senior)",
    subordinated: "Nachrangig",
    debtDetails: "Darlehensdetails",

    // Equalization Purchase
    purchaseDetails: "Kaufdetails",
    equalizationDetails: "Ausgleichsdetails",
    purchasedShares: "Gekaufte Anteile",
    selectShareClassToPurchase: "Zu kaufende Anteilsklasse auswählen",
    equalizationInterestRate: "Ausgleichszinssatz (% p.a.)",
    referenceTransaction: "Referenztransaktion",
    selectReferenceTransaction: "Referenztransaktion auswählen",
    newStakeholderName: "Name des neuen Gesellschafters",

    // New validation messages
    requiredShareCapital: "Benötigtes Stammkapital",
    shareCapitalRequirementWarning: "Hinweis: Die Gesamtinvestition unterschreitet das übliche Stammkapital von {amount}. Die Prüfung erfolgt nur, wenn die Projektwährung mit der Währung der Rechtsform übereinstimmt.",

    // Cap Table Calculation
    asOfDate: "Stichtag",
    capTableTitle: "Kapitalisierungstabelle",
    stakeholder: "Anteilseigner",
    percentage: "Anteil (%)",
    totalIssuedShares: "Gesamtanzahl ausgegebener Anteile",
    vestedShares: "Vested Shares",
    unvestedShares: "Unvested Shares",
    noCapTable: "Berechnen Sie die Cap Table, um die Ergebnisse zu sehen.",

    // Waterfall Simulation
    waterfallSimulationTitle: "Waterfall-Simulation",
    exitProceeds: "Exit-Erlös",
    transactionCosts: "Transaktionskosten",
    simulateWaterfall: "Waterfall simulieren",
    waterfallResultsTitle: "Ergebnis der Waterfall-Verteilung ({currency})",
    initialInvestment: "Init. Invest.",
    fromDebtRepayment: "aus Darlehen",
    fromLiquidationPreference: "aus Präferenz",
    fromParticipation: "aus Partizip.",
    fromConvertedShares: "aus Wandlung / Common",
    totalProceeds: "Gesamterlös",
    multiple: "Multiplikator (x)",
    netExitProceeds: "Netto-Exit-Erlös",
    remainingValue: "Verbleibender Betrag",
    noWaterfallYet: "Geben Sie einen Exit-Erlös ein und starten Sie die Simulation.",
    calculationSteps: "Rechenschritte",
    showCalculationSteps: "Rechenschritte anzeigen",
    hideCalculationSteps: "Rechenschritte ausblenden",

    // Total Capitalization
    totalCapitalizationTitle: "Gesamtkapitalisierungs-Übersicht ({currency})",
    instrument: "Instrument",
    instrumentType: "Typ",
    amountOrShares: "Betrag / Anteile",
    value: "Wert ({currency})",
    equity: "Eigenkapital",
    hybrid: "Hybrid",
    debt: "Fremdkapital",
    
    // Voting Simulation
    votingSimulationTitle: "Stimmrechts-Simulation",
    simulateVote: "Stimmrecht simulieren",
    votingResultsTitle: "Stimmrechtsverteilung",
    votes: "Stimmen",
    totalVotes: "Stimmen Gesamt",
    noVoteYet: "Simulieren Sie die Stimmverteilung, um das Ergebnis zu sehen.",

    // Print & Export Results
    print: "Drucken",
    export: "Exportieren",
    exportAsPng: "Als PNG exportieren",
    exportAsPdf: "Als PDF exportieren",

    // Import / Export
    importExport: "Import / Export",
    importExportTitle: "Daten importieren & exportieren",
    exportToJson: "Als JSON exportieren (Backup)",
    exportDescription: "Laden Sie die Daten des aktiven Projekts in einem technischen JSON-Format herunter.",
    exportAsExcelTemplate: "Als Excel-Vorlage exportieren",
    exportAsExcelTemplateDescription: "Laden Sie die Daten des aktiven Projekts in einer Excel-Datei herunter, um sie zu bearbeiten oder neu zu importieren.",
    importFromExcel: "Aus Excel importieren",
    importDescription: "Laden Sie eine Excel-Datei hoch, um ein neues Projekt zu erstellen. Verwenden Sie die exportierte Vorlage als Ausgangspunkt.",
    importInstructionsTitle: "Benutzerfreundliche Excel-Struktur (4 Blätter):",
    importSheetTransactions: "Blatt 'Transactions': Hauptliste der Ereignisse. Jede Zeile muss einen eindeutigen 'transactionName' haben. Bei Finanzierungsrunden nutzen Sie die Spalte 'convertsLoanTransactionNames', um die zu wandelnden Darlehen anzugeben.",
    importSheetStakeholders: "Blatt 'Stakeholders': Listen Sie alle einzigartigen Personen/Entitäten auf. Jede muss eine eindeutige, benutzerdefinierte 'stakeholderId' haben, um Probleme mit doppelten Namen zu vermeiden.",
    importSheetShareClasses: "Blatt 'ShareClasses': Definiert jede Anteilsklasse, verknüpft über den 'transactionName'.",
    importSheetShareholdings: "Blatt 'Shareholdings': Verknüpft alles über 'transactionName', 'stakeholderId' und 'shareClassName'.",
    dropFileHere: "Excel-Datei hier ablegen oder zum Auswählen klicken",
    importSuccess: "Daten erfolgreich importiert!",
    importError: "Import fehlgeschlagen",
    importSpecificError: "Import fehlgeschlagen: {error}",
    importPreviewTitle: "Import-Vorschau",
    importDataFound: "Projekt '{projectName}' mit {countTransactions} Transaktionen und {countStakeholders} Gesellschaftern gefunden.",
    confirmImport: "Projekt erstellen",
    tryAgain: "Erneut versuchen",
    importPreviewWarning: "Mit der Bestätigung wird ein neues Projekt mit diesen Daten erstellt.",

    // Project Management
    projectsDashboard: "Projekt-Übersicht",
    createNewProject: "Neues Projekt erstellen",
    projectName: "Projektname",
    enterProjectName: "Projektnamen eingeben...",
    create: "Erstellen",
    selectProject: "Projekt auswählen",
    noProjects: "Noch keine Projekte vorhanden. Erstellen Sie eines, um zu beginnen!",
    backToDashboard: "Zurück zur Übersicht",
    confirmDeleteProjectTitle: "Projekt löschen?",
    confirmDeleteProjectMessage: "Sind Sie sicher, dass Sie das Projekt '{projectName}' löschen möchten? Dies ist endgültig und kann nicht rückgängig gemacht werden.",
    renameProject: "Projekt umbenennen",
    activeProject: "Aktives Projekt",
    projectDashboardHintTitle: "Neu hier? Hier starten!",
    projectDashboardHintText: "Um die Funktionen der App ohne manuelle Dateneingabe zu erkunden, laden Sie am besten eines der untenstehenden Beispielszenarien. So sehen Sie schnell und einfach, was das Tool alles kann.",
    
    // Convertible Loan Mechanisms
    conversionMechanism: "Wandlungsmechanismus",
    capAndDiscount: "Cap & Discount",
    fixedPrice: "Fester Preis",
    fixedRatio: "Festes Verhältnis",
    fixedConversionPrice: "Fester Wandlungspreis ({currency} / Anteil)",
    ratioShares: "Anteile",
    forAmount: "für Betrag ({currency})",

    // Help Tooltips
    help: {
      currency: "Geben Sie den 3-stelligen ISO-Code für die Hauptwährung des Projekts ein (z. B. EUR, USD). Diese wird für alle Finanzanzeigen in der gesamten Anwendung verwendet.",
      preMoneyValuation: "Der Wert des Unternehmens, bevor in einer Finanzierungsrunde neues Geld investiert wird.",
      valuationCap: "Eine Obergrenze für die Bewertung, zu der ein Wandelinstrument in Eigenkapital umgewandelt wird. Der Investor erhält den besseren Deal zwischen Bewertungsobergrenze und Discount.",
      discount: "Ein prozentualer Nachlass auf den Preis pro Aktie der Finanzierungsrunde, zu dem das Wandelinstrument umgewandelt wird.",
      liquidationPreferenceType: "NON_PARTICIPATING: Erhält Präferenz oder wandelt in Stammaktien (wählt das Bessere). FULL_PARTICIPATING: Erhält Präferenz UND partizipiert mit Stammaktien. CAPPED_PARTICIPATING: Erhält Präferenz und partizipiert bis eine Gesamtrendite-Obergrenze erreicht ist.",
      participationCapFactor: "Bei 'Capped Participating'-Präferenz ist dies der Gesamtrendite-Multiplikator (z.B. 3x), den ein Investor erhalten kann. Beinhaltet die ursprüngliche Präferenz.",
      antiDilutionProtection: "Schützt frühere Investoren vor Verwässerung, wenn eine zukünftige Finanzierungsrunde zu einer niedrigeren Bewertung ('Down-Round') stattfindet. 'Full Ratchet' ist die stärkste Form.",
      vestingCliff: "Eine Periode zu Beginn eines Vesting-Plans, während der keine Anteile unverfallbar werden. Endet das Arbeitsverhältnis vor dem Cliff, werden keine Anteile gewährt.",
      shareTransfer: "Modelliert eine 'Secondary Transaction', bei der ein bestehender Anteilseigner seine Anteile an einen anderen (neuen oder bestehenden) Anteilseigner verkauft. Diese Transaktion weist Eigentum neu zu, ohne neue Anteile aus der Gesellschaftskasse auszugeben.",
      vestingSchedules: "Vesting-Pläne definieren, wie der Besitz von Anteilen über die Zeit verdient wird, typischerweise für Gründer und Mitarbeiter, um deren langfristiges Engagement sicherzustellen. Ein Plan umfasst eine Gesamt-Vesting-Periode (z.B. 48 Monate) und oft einen 'Cliff' (z.B. 12 Monate). Vor Erreichen des Cliffs werden keine Anteile zugeteilt. Nach dem Cliff wird ein Teil unverfallbar, der Rest üblicherweise monatlich. 'Vested Shares' bestimmen den Eigentumsanteil in Berechnungen wie Stimmrecht und Waterfall-Simulationen.",
      shareholdings: "Listen Sie alle anfänglichen Gesellschafter, ihre Anzahl an Anteilen und das anfängliche Investment auf. Der 'Preis pro Anteil' wird automatisch aus Investment und Anteilen berechnet. Sie können einem Gesellschafter einen Vesting-Plan zuweisen, was bei Gründern oder Mitarbeitern üblich ist.",
      initialShareClasses: "Definieren Sie die anfänglichen Anteilsklassen des Unternehmens. Bei der Gründung ist dies typischerweise 'Common Stock' (Stammanteile) mit einer Stimme pro Anteil und ohne besondere Vorrechte. Komplexere Anteilsklassen werden meist in späteren Finanzierungsrunden eingeführt.",
      convertibleLoan: "Ein Wandeldarlehen (oder Convertible Note) ist eine kurzfristige Schuld, die sich typischerweise in einer zukünftigen Finanzierungsrunde in Eigenkapital umwandelt. Es ist eine übliche Methode für junge Unternehmen, schnell Kapital aufzunehmen. Wählen Sie den Wandlungsmechanismus, der Ihrem Vertrag entspricht.",
      conversionMechanism: "Definiert, wie das Darlehen in Anteile umgewandelt wird. 'Cap & Discount' ist typisch für VC-Deals. 'Fester Preis' verwendet einen vordefinierten Preis pro Anteil. 'Festes Verhältnis' definiert eine feste Anzahl von Anteilen pro investiertem Betrag.",
      fixedPrice: "Das Darlehen wird zu genau diesem Preis pro Anteil in Anteile umgewandelt, unabhängig von der Bewertung in der Finanzierungsrunde.",
      fixedRatio: "Das Darlehen wird auf der Grundlage eines festgelegten Verhältnisses umgewandelt. Zum Beispiel bedeutet '1 Anteil für Betrag 1000', dass der Investor für jeden investierten Betrag in der Projektwährung einen Anteil erhält.",
      financingRoundDetails: "Geben Sie die zentralen Finanzdaten der Runde ein. Die Pre-Money-Bewertung ist der Wert des Unternehmens *vor* diesem neuen Investment. Der Preis pro Anteil für neue Investoren wird basierend auf dieser Bewertung und der Anzahl der vor der Runde ausgegebenen Anteile berechnet.",
      newShareClassDetailsFinancing: "Definieren Sie die neue Anteilsklasse, die an Investoren dieser Runde ausgegeben wird (z.B. 'Series A Preferred'). Diese Anteile haben oft Sonderrechte wie Liquidationspräferenzen (erste Rückzahlung bei einem Exit), Verwässerungsschutz (Schutz vor zukünftigen 'Down-Rounds') und andere Stimmrechte.",
      newInvestors: "Listen Sie die neuen Investoren dieser Runde und ihre jeweiligen Investments auf. Die Anzahl der Anteile, die sie erhalten, wird automatisch basierend auf dem Preis pro Anteil berechnet, der sich aus der Pre-Money-Bewertung ergibt.",
      convertedLoans: "Wählen Sie alle existierenden Wandeldarlehen aus, die in dieser Finanzierungsrunde in Eigenkapital umgewandelt werden sollen. Der Darlehensbetrag plus aufgelaufene Zinsen wird in Anteile der neuen Klasse umgewandelt, basierend auf den spezifischen Bedingungen des Darlehens (Valuation Cap, Discount).",
      debtInstrument: "Erfassen Sie nicht wandelbares Fremdkapital, wie z.B. Bankdarlehen. Der Rang ('Senior Besichert', 'Senior Unbesichert', 'Nachrangig') ist entscheidend, da er die Reihenfolge der Rückzahlung bei einer Liquidation bestimmt, bevor Eigenkapitalgeber Erlöse erhalten.",
      updateShareClass: "Diese Transaktion ermöglicht es, die Eigenschaften einer bestehenden Anteilsklasse ab einem bestimmten Datum zu ändern. Sie könnten zum Beispiel die Stimmen pro Anteil erhöhen oder die Bedingungen der Liquidationspräferenz ändern. Dies ist eine mächtige, aber seltenere Transaktion, die die Kapitalstruktur erheblich verändern kann.",
      equalizationPurchase: "Modelliert eine Transaktion, bei der ein neuer Investor zu einem späteren Zeitpunkt einsteigt, aber wirtschaftlich so behandelt werden möchte, als hätte er früher investiert. Dies wird erreicht, indem der ursprüngliche Anteilspreis zuzüglich eines berechneten Zinsbetrags gezahlt wird, um den Einstieg 'auszugleichen'.",
      purchaseDetails: "Die Kerndetails des Anteilskaufs. Ähnlich einer sekundären Transaktion, aber mit einer Ausgleichskomponente.",
      equalizationDetails: "Definiert die Zinsberechnung, um diese Investition mit einer früheren gleichzustellen. Wählen Sie die Transaktion (z.B. eine frühere Finanzierungsrunde), auf die dieser Kauf für die Zinsberechnung zurückdatiert werden soll.",
      equalizationInterestRate: "Der jährliche Zinssatz zur Berechnung der Zusatzzahlung, die erforderlich ist, um diesen späten Einstieg mit einer früheren Investition 'auszugleichen'."
    },

    // User Guide
    userGuideTitle: "Anleitung & Beispielfälle",
    showGuide: "Anleitung & Beispiele anzeigen",
    hideGuide: "Anleitung & Beispiele ausblenden",
    tabHowItWorks: "So funktioniert's",
    tabUseCases: "Anwendungsfälle",
    tabSampleScenarios: "Beispielszenarien",
    howItWorks: {
        title: "So funktioniert der Equity Scenario Simulator",
        intro: "Diese Anwendung hilft Ihnen, Unternehmensbeteiligungen zu modellieren und zu verstehen. Sie funktioniert in drei Hauptschritten: Dateneingabe, Berechnung und Simulation. Alle Daten bleiben auf Ihrem Gerät.",
        step1Title: "Schritt 1: Projekt & Gründungstransaktion erstellen",
        step1Text: "Alles beginnt mit einem Projekt. Erstellen Sie auf dem Dashboard ein neues Projekt. Sie werden dann aufgefordert, die erste Transaktion anzulegen: die 'Gründung'. Hier definieren Sie die initialen Anteilsklassen (z. B. Stammanteile), wer wie viele Anteile besitzt (die Gründungsgesellschafter) und die primäre Währung des Projekts.",
        step2Title: "Schritt 2: Transaktionen chronologisch hinzufügen",
        step2Text: "Bauen Sie die Historie des Unternehmens auf, indem Sie Transaktionen in der Reihenfolge ihres Stattfindens hinzufügen. Nutzen Sie die Buttons oben, um Finanzierungsrunden, Wandeldarlehen, Fremdkapital oder Anteilsübertragungen hinzuzufügen. Jede Transaktion aktualisiert die Kapitalstruktur ab ihrem Datum.",
        step3Title: "Schritt 3: Cap Table analysieren",
        step3Text: "Die Kapitalisierungstabelle (Cap Table) zeigt, wem welcher prozentuale Anteil am Unternehmen zu einem bestimmten Zeitpunkt gehört. Verwenden Sie den 'Simulationsstichtag'-Wähler, um die Cap Table zu jedem Zeitpunkt in der Vergangenheit oder Zukunft anzuzeigen. Die Tabelle berücksichtigt automatisch alle 'aktiven' Transaktionen bis zu diesem Datum.",
        step4Title: "Schritt 4: Simulationen durchführen",
        step4Text: "Die wahre Stärke des Tools liegt in den Simulationen. Die Wasserfallanalyse zeigt, wie die Erlöse aus einem Unternehmensverkauf auf alle Beteiligten verteilt würden, unter Berücksichtigung von Schulden-Rangfolgen und Liquidationspräferenzen. Die Stimmrechts-Simulation zeigt die Verteilung der Stimmrechte basierend auf den gevesteten Anteilen."
    },
    loadScenario: "Dieses Szenario laden",
    sampleScenarios: "Beispielszenarien",
    useCases: {
        title: "Anwendungsfälle",
        goal: "Ziel",
        features: "Genutzte Features",
        uc01Title: "UC-01: Projekt- & Portfolio-Management",
        uc01Goal: "Mehrere unabhängige Unternehmen (Mandanten, Portfoliofirmen) ohne Datenvermischung verwalten und den Arbeitsstand sicher speichern.",
        uc01Features: "Projekt-Übersicht, Local Storage",
        uc02Title: "UC-02: Initiales Setup & Gründer-Vesting",
        uc02Goal: "Eine saubere Cap Table nach der Gründung erstellen, inklusive der Anteile und Vesting-Pläne der Gründer, um deren langfristige Bindung zu modellieren.",
        uc02Features: "Gründungstransaktion, Vesting-Pläne",
        uc03Title: "UC-03: Modellierung von Finanzierungsrunden",
        uc03Goal: "Die Auswirkungen von Seed- (Wandelanleihen) und Wachstumsrunden (Series A/B) auf die Cap Table verstehen, inklusive der Wandlungsmechanismen.",
        uc03Features: "Wandelinstrumente (Cap/Discount), Finanzierungsrunden",
        uc04Title: "UC-04: Down-Round-Simulation",
        uc04Goal: "Die Schutzwirkung einer 'Anti-Dilution'-Klausel (z.B. Full Ratchet) bei einer Finanzierungsrunde mit niedrigerer Bewertung quantifizieren.",
        uc04Features: "Verwässerungsschutz",
        uc05Title: "UC-05: Umfassende Exit-Analyse (Waterfall)",
        uc05Goal: "Simulieren, wie ein Verkaufserlös unter Berücksichtigung der gesamten Kapitalstruktur (Senior Debt, Wandelanleihen, Präferenzen) verteilt wird.",
        uc05Features: "Waterfall-Simulation, Darlehen, Rang",
        uc06Title: "UC-06: Governance- & Kontroll-Analyse",
        uc06Goal: "Die historische Entwicklung der Stimmrechte nach jeder Transaktion nachvollziehen, um zu verstehen, wann und wie sich Kontrollverhältnisse verschoben haben.",
        uc06Features: "Stimmrechts-Simulation, Historische Analyse",
        uc07Title: "UC-07: Modellierung von Secondaries",
        uc07Goal: "Eine Anteilsübertragung zwischen Gesellschaftern (z.B. ein Gründer verkauft Anteile an einen neuen Investor) korrekt in der Cap Table abbilden.",
        uc07Features: "Anteilsübertragung",
        uc08Title: "UC-08: Effizientes Daten-Management",
        uc08Goal: "Eine bestehende, komplexe Cap Table schnell und fehlerfrei über eine Excel-Datei in das Tool importieren oder ein Szenario als Backup exportieren.",
        uc08Features: "Excel-Import, JSON-Export",
        uc09Title: "UC-09: Onboarding & Lernprozess",
        uc09Goal: "Mithilfe von vordefinierten Beispielszenarien und einer kontextsensitiven Hilfe die Funktionsweise komplexer Klauseln verstehen und das Tool schnell erlernen.",
        uc09Features: "Anleitung, Tooltips, Beispielszenarien",
    },
    scenarioSeedRoundTitle: "Szenario 1: Typische Seed-Runde",
    scenarioSeedRoundDescription: "Demonstriert eine Unternehmensgründung, ein Wandeldarlehen von einem Angel-Investor und eine anschließende Seed-Finanzierungsrunde, die das Darlehen wandelt. Beinhaltet einen Vesting-Plan für einen Gründer.",
    scenarioDownRoundTitle: "Szenario 2: Down-Round mit Verwässerungsschutz",
    scenarioDownRoundDescription: "Zeigt die Auswirkung einer 'Down-Round' (eine Finanzierungsrunde mit geringerer Bewertung). Ein früherer Investor mit 'Full Ratchet'-Verwässerungsschutz erhält zusätzliche Anteile zum Ausgleich.",
    scenarioAdvancedWaterfallTitle: "Szenario 3: Erweiterter Waterfall & Schulden",
    scenarioAdvancedWaterfallDescription: "Demonstriert eine Waterfall-Simulation mit besicherten und nachrangigen Darlehen, um die korrekte Rückzahlungshierarchie vor der Eigenkapitalverteilung zu zeigen.",
    scenarioGovernanceTitle: "Szenario 4: Governance & Secondaries",
    scenarioGovernanceDescription: "Illustriert eine Anteilsübertragung (Secondary) von einem Gründer an einen neuen Investor, kombiniert mit einer Anpassung der Stimmrechte zur Schaffung einer Super-Majority.",

    // Workflow Diagram
    workflowTitle: "Unternehmens-Lebenszyklus",
    workflowNodeFoundingTitle: "1. Gründung",
    workflowNodeFoundingDesc: "Definieren Sie Gründer, initiale Anteile und Vesting-Pläne.",
    workflowNodeEarlyFinanceTitle: "2. Frühphasen-Finanzierung",
    workflowNodeEarlyFinanceDesc: "Kapitalaufnahme durch Wandeldarlehen oder SAFEs vor einer bewerteten Runde.",
    workflowNodeGrowthTitle: "3. Wachstums-Finanzierung",
    workflowNodeGrowthDesc: "Führen Sie bewertete Runden (z.B. Series A, B) durch, um zu wachsen.",
    workflowNodeOngoingTitle: "4. Laufende Verwaltung",
    workflowNodeOngoingDesc: "Verwalten Sie Mitarbeiteroptionen (ESOP), Secondaries und andere Ereignisse.",
    workflowNodeExitTitle: "5. Exit / Liquidation",
    workflowNodeExitDesc: "Simulieren Sie die Waterfall-Verteilung bei einer Übernahme oder einem Börsengang.",
    workflowStartHere: "Hier starten",

    // Date Filtering
    simulationDateLabel: "Simulationsstichtag",
    futureTransaction: "Zukünftig",
    futureTransactionTooltip: "Das Datum dieser Transaktion liegt nach dem Simulationsstichtag und wird in der aktuellen Berechnung nicht berücksichtigt.",

    // Accessibility
    accessibilityControls: "Barrierefreiheit",
    decreaseFontSize: "Schriftgröße verkleinern",
    increaseFontSize: "Schriftgröße vergrößern",
    themeClassic: "Klassisch",
    themeModern: "Modern",
    themeContrast: "Hoher Kontrast",
    decreaseFontSizeTooltip: "Schriftgröße verkleinern",
    increaseFontSizeTooltip: "Schriftgröße vergrößern",
    themeClassicTooltip: "Klassisches Design",
    themeModernTooltip: "Modernes Design",
    themeContrastTooltip: "Hoher Kontrast Design",

    // Legal & Footer
    footer: {
      legalNotice: "Impressum, Datenschutz & Disclaimer",
    },
    legal: {
      title: "Rechtliche Hinweise",
      tabImpressum: "Impressum",
      tabPrivacy: "Datenschutz",
      tabDisclaimer: "Disclaimer & Lizenz",
      impressumTitle: "Impressum",
      impressumText: "Angaben gemäß § 5 TMG:\n\nJörn Densing\nAuf dem Köllenhof 81\n53343 Wachtberg\nDeutschland\n\nKontakt:\nTelefon: +49 175 2425446\nE-Mail: kontakt@jodecon.de",
      privacyTitle: "Datenschutzerklärung",
      privacyText: `
**1. Grundprinzip**
Diese Anwendung ist ein rein clientseitiges Werkzeug. Das bedeutet, die gesamte Logik, alle Berechnungen und die Datenspeicherung finden direkt in Ihrem Webbrowser auf Ihrem eigenen Computer statt.

**2. Speicherort und Sicherheit**
Alle von Ihnen eingegebenen Daten werden ausschließlich im lokalen Speicher (\`localStorage\`) Ihres Webbrowsers gespeichert.
- **Kein Serverkontakt:** Ihre Daten werden **niemals** an einen externen Server gesendet oder dort gespeichert. Wir haben keinen Zugriff auf Ihre Daten.
- **Daten verbleiben auf Ihrem Gerät:** Ihre Finanzmodelle sind privat und bleiben auf Ihrem Computer unter Ihrer Kontrolle.

**3. Datenverfügbarkeit und Sicherung**
- **Gerätespezifisch:** Die im \`localStorage\` gespeicherten Daten sind an den spezifischen Browser und das spezifische Gerät gebunden, das Sie verwenden. Daten werden **nicht** automatisch zwischen verschiedenen Computern oder Browsern synchronisiert.
- **Sicherung durch den Nutzer:** Um ein Szenario zu sichern oder auf ein anderes Gerät zu übertragen, können Sie die Funktion 'Als JSON exportieren (Backup)' nutzen. Da die Anwendung ohne Garantie auf Verfügbarkeit oder Support bereitgestellt wird (siehe Haftungsausschluss), liegt die Sicherung von für Sie wichtigen Daten in Ihrer alleinigen Verantwortung.

**4. Löschung Ihrer Daten**
Sie haben die vollständige Kontrolle über die Löschung Ihrer Daten durch Funktionen innerhalb der App oder durch das Löschen der Websitedaten Ihres Browsers.

**5. Dienste von Drittanbietern**
Diese Anwendung verwendet öffentliche Content Delivery Networks (CDNs), um notwendige Bibliotheken wie XLSX.js zu laden. Dies kann dazu führen, dass Ihr Browser diese Drittanbieter-Server kontaktiert, um diese Dateien herunterzuladen.
`,
      disclaimerTitle: "Disclaimer & Lizenz",
      disclaimerText: `**Haftungs- und Gewährleistungsausschluss**
Diese Anwendung wird als kostenloses Werkzeug für Simulationszwecke "wie besehen" zur Verfügung gestellt. Die Ergebnisse basieren auf den von Ihnen bereitgestellten Daten und stellen keine Finanz-, Rechts- oder Steuerberatung dar.

Die Nutzung dieses Tools erfolgt auf Ihr eigenes Risiko. Der Betreiber übernimmt keinerlei Haftung für die Richtigkeit, Vollständigkeit oder Aktualität der Simulationen, oder für direkte oder indirekte Schäden, die aus der Nutzung der Anwendung entstehen.

Es wird kein Support für die Anwendung geleistet und es gibt keine Garantie für die langfristige Verfügbarkeit, Funktionalität oder Fehlerfreiheit des Dienstes.

**Feedback**
Ich bin dankbar für jedes Feedback oder Verbesserungsvorschläge. Bitte senden Sie diese an: kontakt@jodecon.de

**Copyright & Lizenz**
Copyright (c) 2025 Jörn Densing, Wachtberg (Deutschland)

Alle Rechte vorbehalten.

Die Erlaubnis, diese Software und ihre Dokumentation für beliebige Zwecke und ohne Gebühr zu nutzen, zu kopieren, zu modifizieren und zu verbreiten, wird hiermit ohne eine schriftliche Vereinbarung mit Jörn Densing, Wachtberg (Deutschland), untersagt.
`,
    },
  },
};

export type Translations = typeof translations.en;