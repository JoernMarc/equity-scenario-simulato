# Equity Scenario Simulator

[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](LICENSE) [![Status](https://img.shields.io/badge/status-active-success.svg)]()

A sophisticated, client-side web application for modeling capitalization tables, analyzing financing rounds, and performing waterfall simulations for private market investments.

**All data is processed and stored exclusively in your browser. Nothing is ever sent to a server.**

---

### [🚀 Test the Live Application](https://[your-github-username].github.io/[your-repo-name]/)

---

![Application Screenshot](https://via.placeholder.com/800x450.png?text=Application+Screenshot+Here)
*(A placeholder for a screenshot or animated GIF of the application in action)*

## Key Features

- **Dynamic Cap Table Calculation:** View a detailed capitalization table for any point in time.
- **Comprehensive Waterfall Analysis:** Simulate how exit proceeds are distributed, respecting the entire capital structure (senior debt, convertibles, liquidation preferences).
- **Advanced Transaction Modeling:** Supports a wide range of transactions:
  - Company Founding & Initial Shareholding
  - Convertible Loans (with Cap & Discount, Fixed Price, or Fixed Ratio)
  - Priced Financing Rounds (e.g., Series A, B)
  - Anti-Dilution Protection (Full Ratchet, Broad-Based)
  - Debt Instruments (Senior Secured, Subordinated)
  - Share Transfers (Secondaries) & Equalization Purchases
  - Vesting Schedules for founders and employees.
- **Governance & Control Analysis:** Simulate voting power distribution to understand how control shifts over time.
- **Multi-Project Management:** Manage multiple independent companies or scenarios without data mingling.
- **Efficient Data Handling:**
  - Securely persists all data in your browser's local storage.
  - Export and import projects via JSON for backup and portability.
  - Import complex cap tables from a user-friendly Excel template.
- **Accessibility & Theming:** Features controls for font size and multiple color themes, including a high-contrast mode.

## Technology Stack

- **Build Tool:** [Vite](https://vitejs.dev/)
- **Frontend:** [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) with a custom CSS variable-based theming system.
- **Diagrams:** [ReactFlow](https://reactflow.dev/) for the interactive company lifecycle diagram.
- **Data Handling:** [SheetJS (XLSX)](https://sheetjs.com/) for Excel import/export.
- **PDF/Image Export:** [jsPDF](https://github.com/parallax/jsPDF) and [html2canvas](https://html2canvas.hertzen.com/) for exporting views.

## Local Setup

This project uses Vite for development and building.

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/[your-github-username]/[your-repo-name].git
    cd [your-repo-name]
    ```

2.  **Install dependencies:**
    (Requires Node.js and npm)
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```

4.  **Open in your browser:**
    Navigate to the local address provided by Vite (usually `http://localhost:5173`).

## Building for Production

To create an optimized build for deployment (e.g., on GitHub Pages):

```bash
npm run build
```

This will generate a `dist` directory with all the static assets ready for hosting.

## License

This project is released under a proprietary license. All rights are reserved.

Permission to use, copy, modify, and distribute this software and its documentation for any purpose and without fee is hereby prohibited, without a written agreement with the copyright holder.

Please see the [LICENSE](LICENSE) file for full details.

## Disclaimer

This application is provided as a free tool for simulation purposes on an "as is" basis. The results are based on the data you provide and do not constitute financial, legal, or tax advice.

Use of this tool is at your own risk. The operator assumes no liability whatsoever for the accuracy, completeness, or timeliness of the simulations, nor for any direct or indirect damages arising from the use of the application.