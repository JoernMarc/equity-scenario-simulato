# Technical Documentation: Equity Scenario Simulator

## 1. Introduction

This document provides a technical overview of the Equity Scenario Simulator application. It is a client-side web application built with React, TypeScript, and Tailwind CSS. Its primary purpose is to allow users to model company capitalization tables, simulate financing rounds, and analyze liquidation scenarios (waterfall analysis) without any data ever leaving their browser.

- **Core Technologies:** React 18, TypeScript, Tailwind CSS
- **Key Libraries:** ReactFlow, SheetJS (XLSX), jsPDF, html2canvas
- **Persistence:** All project data is stored exclusively in the browser's `localStorage`.

---

## 2. Project Structure

The project is organized into logical directories and files to separate concerns:

```
/
├── components/       # Reusable React components
│   ├── forms/        # Form components for each transaction type
│   ├── icons/        # SVG icons as React components
│   └── ...           # UI components (Header, Footer, Views)
├── contexts/         # React Context providers (Localization, Project)
├── data/             # Static data like sample scenarios
├── doc/              # Documentation files (MD)
├── logic/            # Core business logic and calculations
│   ├── calculations.ts # Core financial modeling functions
│   ├── importExport.ts # Excel/JSON import/export logic
│   └── utils.ts        # Small utility functions
├── styles/           # Global styles and icon components
├── App.tsx           # Main application component, state management
├── i18n.ts           # Internationalization (DE/EN)
├── types.ts          # Core TypeScript type definitions
├── constants.ts      # Application-wide constants
└── index.tsx         # Main entry point for React
├── index.html        # The single HTML page
└── metadata.json     # Application metadata
```

---

## 3. State Management (`App.tsx`)

The application's state is managed within the main `App.tsx` component using React's `useState` and `useMemo` hooks.

- **`AppState` Interface:** The root state is defined by the `AppState` interface:
  ```typescript
  interface AppState {
    projects: Record<string, Project>;
    activeProjectId: string | null;
    comparisonProjectIds: [string | null, string | null];
  }
  ```
- **Application Modes:** The application operates in one of three modes, determined by the state:
  1.  **Dashboard Mode:** `activeProjectId` and `comparisonProjectIds` are both null. The `ProjectDashboard` is displayed.
  2.  **Single Project Mode:** `activeProjectId` has a value. The main project view with the transaction log and simulation results is displayed.
  3.  **Comparison Mode:** `comparisonProjectIds` contains two valid project IDs. The `ComparisonView` is displayed.
- **`Project` Interface:** Each project contains its own set of transactions and stakeholders.
- **Persistence:** The `appState` is serialized to JSON and stored in `localStorage` under the key `capTableAppState_v2`. This ensures that all user data persists across browser sessions on the same device.
- **Derived State:** `useMemo` is used extensively to derive data from the core state, such as the active project's transactions, the current capitalization table (`capTableResult`), and filtered transaction lists for searching. This prevents redundant calculations on every render.

---

## 4. Core Logic (`logic/calculations.ts`)

This file contains the "brains" of the application. It is pure, testable TypeScript with no React dependencies.

### 4.1. Date Logic and Simulation

The application uses a sophisticated date system to enable accurate point-in-time analysis. A user selects a single **Simulation Date**, which acts as the "present moment" for all calculations.

Each transaction has three key date-related fields that interact with the Simulation Date:
- **`date`:** The historical date of the transaction (e.g., the signing date). Its primary purpose is to ensure the transaction log is always sorted chronologically for human readability. It is **not** used directly in financial calculations.
- **`validFrom`:** The effective date for calculations. A transaction is only included in a simulation if its `validFrom` date is on or before the user-selected **Simulation Date**.
- **`validTo`:** An optional expiration date. If set, the transaction ceases to be effective for calculations on any **Simulation Date** that falls after this date.

This combination of a global Simulation Date with each transaction's `status`, `validFrom`, and `validTo` fields determines the exact set of "active" transactions used in every calculation function (`calculateCapTable`, `simulateWaterfall`, etc.).

### 4.2. Key Calculation Functions

- **`getShareClassesAsOf(transactions, date)`:** Reconstructs the exact state of all share classes at a given point in time by chronologically applying all `FOUNDING`, `FINANCING_ROUND`, and `UPDATE_SHARE_CLASS` transactions. This is crucial for ensuring calculations use the correct terms (e.g., votes per share, preferences) for a given date.
- **`calculateCapTable(transactions, date)`:** The main function for building the cap table.
    1.  It filters for all active transactions up to the specified Simulation Date.
    2.  It iterates through these transactions chronologically, building up a map of shareholdings.
    3.  For `FINANCING_ROUND` transactions, it recursively calls `calculateCapTable` for the moment just before the round to determine the correct pre-money share price. It then calculates and applies anti-dilution adjustments (`FULL_RATCHET`, `BROAD_BASED`, `NARROW_BASED`) and handles the conversion of any selected `CONVERTIBLE_LOAN`s based on their specific terms.
    4.  It processes `SHARE_TRANSFER` and `EQUALIZATION_PURCHASE` transactions by adjusting share ownership between stakeholders.
    5.  It groups the final shareholdings by stakeholder and share class into `CapTableEntry` items.
    6.  It calculates vested vs. unvested shares for each entry based on any assigned `VestingSchedule` and the Simulation Date.
- **`simulateWaterfall(...)`:** Performs the liquidation analysis.
    1.  Calculates net proceeds (`Exit Proceeds - Transaction Costs`).
    2.  Pays off all debt instruments and unconverted loans in order of seniority (`SENIOR_SECURED` -> `SENIOR_UNSECURED` -> `SUBORDINATED`).
    3.  Pays out liquidation preferences based on rank and factor.
    4.  Distributes the final remaining amount pro-rata among common and participating preferred shareholders, respecting participation caps.
- **`summarizeWaterfallByStakeholder(...)`:** Aggregates the detailed `WaterfallResult` into a high-level summary. It groups all payout sources (debt, preference, participation, etc.) by stakeholder to provide a clean total payout and return multiple (MOIC) for each entity, powering the "Exit Payout Summary" view.
- **`simulateVote(...)`:** Calculates voting power distribution based on the vested shares in the cap table and the `votesPerShare` property of each share class.

### 4.3. Project Assessment Engine

- **`assessProject(transactions, capTable, t)`:** A non-AI, rule-based heuristic engine that provides insights into the project's structure.
    - **Principle:** This function was designed to be 100% client-side to maintain user privacy. It is **not** a connection to a large language model.
    - **Functionality:** It analyzes the provided `capTable` and historical `transactions` against a set of predefined rules based on common venture financing standards.
    - **Rules Checked:** The engine looks for common patterns, such as:
        - Missing vesting schedules for founders.
        - The presence of aggressive terms like "Full Ratchet" anti-dilution or high liquidation preference multiples (>2x).
        - The occurrence of a "down round" (a financing round at a lower valuation than the previous one).
        - Adherence to best practices, such as standard 4-year vesting schedules with a 1-year cliff.
    - **Output:** It returns a `ProjectAssessmentResult` object containing a list of `AssessmentFinding`s, each with a severity level (`danger`, `warning`, `info`), a title, and a descriptive text.

---

## 5. Side-by-Side Project Comparison

The application features a powerful comparison view that allows users to analyze two projects simultaneously under the same simulation conditions.

- **Initiation:** The comparison is started from the `ProjectDashboard`, where a user can select two projects. This updates the `comparisonProjectIds` in the main `AppState`.
- **`ComparisonView.tsx` Component:** This component is rendered when the application is in comparison mode.
  - It receives the two project IDs and the list of all available projects.
  - It maintains its own internal state for shared simulation inputs (`simulationDate`, `exitProceeds`, `transactionCosts`).
  - It runs all calculation functions (`calculateCapTable`, `assessProject`, etc.) independently for each of the two projects.
  - The results are displayed in a two-column layout, with each column containing the full suite of result-display components (`CapTableView`, `WaterfallView`, etc.).
  - Users can change which projects are being compared using dropdowns within the view, which updates the `comparisonProjectIds` in the parent `App` component.

---

## 6. Data Model (`types.ts`)

This file is the single source of truth for all data structures in the application.

- **`Transaction`:** A union type representing all possible events that can modify the cap table (e.g., `FoundingTransaction`, `FinancingRoundTransaction`). Each transaction type has a unique `type` property and its own specific data fields.
- **`ShareClass`:** Defines the rights and properties of a class of shares (e.g., 'Common Stock', 'Series A Preferred'). This includes liquidation preferences, anti-dilution rights, and voting power.
- **`Shareholding`:** Represents a specific stakeholder's ownership of a number of shares of a specific share class.
- **`Stakeholder`:** A simple object representing a person or entity.
- **Result Types:** `CapTable`, `WaterfallResult`, `VotingResult` define the structure of the data that is calculated and displayed to the user.

---

## 7. Import/Export (`logic/importExport.ts`)

- **JSON Export:** The application can export the active project's data (transactions and stakeholders) into a simple JSON file. This serves as a complete and portable backup.
- **Excel Export/Import (Multi-Sheet Format):**
    -   **Approach:** To make the Excel files user-friendly and editable, the application uses a "normalized" multi-sheet format, moving away from the previous method of storing JSON strings in cells.
    -   **Export (`exportToExcel`):** The export function de-normalizes the nested `Transaction` objects into several flat tables. It creates an Excel file with five distinct sheets: `Transactions`, `Stakeholders`, `ShareClasses`, `Shareholdings`, and `VestingSchedules`. Each item in the `ShareClasses`, `Shareholdings`, and `VestingSchedules` sheets contains a `transaction_id` column to link it back to the corresponding event in the main `Transactions` sheet.
    -   **Import (`parseExcelImport`):** The import function performs the reverse process of re-normalization. It reads all five sheets from the uploaded Excel file, groups the detailed data from the satellite sheets by `transaction_id`, and then iterates through the main `Transactions` sheet to reconstruct the original, nested `Transaction` objects that the application's logic engine understands. This robust approach allows users to edit complex scenarios directly in a spreadsheet.