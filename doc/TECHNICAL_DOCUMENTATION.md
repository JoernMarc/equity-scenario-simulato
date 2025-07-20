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
├── data/             # Static data like sample scenarios
├── doc/              # Documentation files (MD)
├── logic/            # Core business logic and calculations
│   ├── calculations.ts # Core financial modeling functions
│   ├── importExport.ts # Excel/JSON import/export logic
│   └── utils.ts        # Small utility functions
├── App.tsx           # Main application component, state management
├── i18n.ts           # Internationalization (DE/EN)
├── types.ts          # Core TypeScript type definitions
├── constants.ts      # Application-wide constants
└── index.tsx         # Main entry point for React
├── index.html            # The single HTML page
└── metadata.json         # Application metadata
```

---

## 3. State Management (`App.tsx`)

The application's state is managed within the main `App.tsx` component using React's `useState` and `useMemo` hooks.

- **`AppState` Interface:** The root state is defined by the `AppState` interface:
  ```typescript
  interface AppState {
    projects: Record<string, Project>;
    activeProjectId: string | null;
  }
  ```
- **`Project` Interface:** Each project contains its own set of transactions and stakeholders.
- **Persistence:** The `appState` is serialized to JSON and stored in `localStorage` under the key `capTableAppState_v2`. This ensures that all user data persists across browser sessions on the same device.
- **Derived State:** `useMemo` is used extensively to derive data from the core state, such as the active project's transactions, the current capitalization table (`capTableResult`), and filtered transaction lists for searching. This prevents redundant calculations on every render.

---

## 4. Core Logic (`logic/calculations.ts`)

This file contains the "brains" of the application. It is pure, testable TypeScript with no React dependencies.

- **`getShareClassesAsOf(transactions, date)`:** Reconstructs the exact state of all share classes at a given point in time by chronologically applying all `FOUNDING`, `FINANCING_ROUND`, and `UPDATE_SHARE_CLASS` transactions. This is crucial for ensuring calculations use the correct terms (e.g., votes per share, preferences) for a given date.
- **`calculateCapTable(transactions, date)`:** The main function for building the cap table.
    1.  It gets all active transactions up to the specified date.
    2.  It iterates through transactions chronologically, building a list of `Shareholding` objects.
    3.  For `FINANCING_ROUND` transactions, it handles anti-dilution adjustments and the conversion of `CONVERTIBLE_LOAN`s.
    4.  It processes `SHARE_TRANSFER` and `EQUALIZATION_PURCHASE` transactions by adjusting share ownership.
    5.  It groups the final shareholdings by stakeholder and share class into `CapTableEntry` items.
    6.  It calculates vested vs. unvested shares for each entry based on any assigned `VestingSchedule`.
- **`simulateWaterfall(...)`:** Performs the liquidation analysis.
    1.  Calculates net proceeds (`Exit Proceeds - Transaction Costs`).
    2.  Pays off all debt instruments and unconverted loans in order of seniority (`SENIOR_SECURED` -> `SENIOR_UNSECURED` -> `SUBORDINATED`).
    3.  For remaining proceeds, it evaluates if non-participating preferred shareholders are better off taking their preference or converting to common stock.
    4.  Pays out liquidation preferences to those who did not convert.
    5.  Distributes the final remaining amount pro-rata among common, converted, and participating preferred shareholders, respecting participation caps.
- **`simulateVote(...)`:** Calculates voting power distribution based on the vested shares in the cap table and the `votesPerShare` property of each share class.

---

## 5. Data Model (`types.ts`)

This file is the single source of truth for all data structures in the application.

- **`Transaction`:** A union type representing all possible events that can modify the cap table (e.g., `FoundingTransaction`, `FinancingRoundTransaction`). Each transaction type has a unique `type` property and its own specific data fields.
- **`ShareClass`:** Defines the rights and properties of a class of shares (e.g., 'Common Stock', 'Series A Preferred'). This includes liquidation preferences, anti-dilution rights, and voting power.
- **`Shareholding`:** Represents a specific stakeholder's ownership of a number of shares of a specific share class.
- **`Stakeholder`:** A simple object representing a person or entity.
- **Result Types:** `CapTable`, `WaterfallResult`, `VotingResult` define the structure of the data that is calculated and displayed to the user.

---

## 6. Import/Export (`logic/importExport.ts`)

- **JSON Export:** The application can export the active project's data (transactions and stakeholders) into a simple JSON file. This serves as a complete and portable backup.
- **Excel Export/Import:**
    -   **Export:** Creates a user-friendly Excel file with four sheets (`Stakeholders`, `Transactions`, `ShareClasses`, `Shareholdings`). It generates human-readable IDs to link the data across sheets.
    -   **Import:** Parses an Excel file structured like the exported template. It reconstructs the transaction and stakeholder data, allowing users to bulk-create or migrate complex scenarios. The logic handles mapping the user-defined IDs back to the application's internal data structures.