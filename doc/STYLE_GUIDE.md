# Style Guide: Equity Scenario Simulator

## 1. Introduction

This style guide outlines the design principles, theming system, and CSS architecture for the Equity Scenario Simulator. Adhering to this guide ensures a consistent, accessible, and maintainable user interface.

The application uses **Tailwind CSS** for utility-first styling, enhanced by a custom CSS variable-based theming system.

---

## 2. Theming System

The core of the application's visual appearance is controlled by a theming system defined in `index.html`. This allows for global style changes (e.g., light mode, dark mode, high-contrast mode) without altering component-level class names.

### 2.1. Core Principles

- **CSS Variables:** All colors are defined as CSS variables (e.g., `--color-text-primary`).
- **RGB Channels:** Colors are defined as RGB channels (`R G B`) rather than hex codes. This allows for easy opacity modification using Tailwind's slash notation (e.g., `bg-theme-interactive/50`).
- **Theme-Aware Utilities:** Components **must** use custom theme-aware utility classes (e.g., `.bg-theme-surface`) instead of hard-coded Tailwind colors (e.g., `.bg-white`). This is the most critical rule for ensuring theme compatibility.

### 2.2. Available Themes

The application supports three themes, which are applied by adding a class to the `<body>` element.

| Class Name              | Theme Name      | Description                                |
|-------------------------|-----------------|--------------------------------------------|
| (none) or `.theme-classic`| **Classic**     | The default, clean, and professional theme.    |
| `.theme-modern`         | **Modern**      | A theme with subdued grays and an emerald accent. |
| `.theme-high-contrast`  | **High Contrast** | A dark theme designed for maximum readability. |

### 2.3. Key CSS Variables

These variables are defined in the `:root` and theme-specific blocks in `index.html`.

- **Text Colors:**
  - `--color-text-primary`: Main text color for headings and important content.
  - `--color-text-secondary`: Secondary text for labels, descriptions.
  - `--color-text-subtle`: For placeholder text and non-critical info.
  - `--color-text-on-interactive`: Text color for use on interactive-colored backgrounds (e.g., buttons).

- **Background Colors:**
  - `--color-bg-background`: The main background color of the page.
  - `--color-bg-surface`: The background for cards, modals, and other "surface" elements.
  - `--color-bg-subtle`: A slightly different background for hover states or nested elements.

- **Interactive Element Colors:**
  - `--color-interactive`: The main accent color for buttons, links, and focused inputs.
  - `--color-interactive-hover`: The hover state for the interactive color.
  - `--color-disabled`: The color for disabled buttons and inputs.

- **Border Colors:**
  - `--color-border-strong`: For input fields and important dividers.
  - `--color-border-subtle`: For less prominent dividers and card borders.

- **Semantic Colors:** (Used for alerts, success/error states)
  - `--color-danger`, `--color-danger-hover`
  - `--color-success`, `--color-success-hover`
  - `--color-danger-subtle-bg`, `--color-danger-subtle-text` (for alert backgrounds/text)
  - `--color-success-subtle-bg`, `--color-success-subtle-text`
  - `--color-warning-subtle-bg`, `--color-warning-subtle-text`

---

## 3. Usage and Utility Classes

To apply themes correctly, use the provided utility classes in your components. These are defined in `index.html` and map directly to the CSS variables.

**Example: Creating a Themed Button**

```jsx
// CORRECT: Uses theme-aware utility classes
<button className="px-4 py-2 bg-theme-interactive text-theme-on-interactive rounded-md hover:bg-theme-interactive-hover">
  Save
</button>

// INCORRECT: Uses hard-coded Tailwind colors, will not adapt to themes
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  Save
</button>
```

**Commonly Used Utility Classes:**

- **Backgrounds:** `bg-theme-background`, `bg-theme-surface`, `bg-theme-subtle`
- **Text:** `text-theme-primary`, `text-theme-secondary`, `text-theme-subtle`, `text-theme-on-interactive`
- **Interactivity:** `bg-theme-interactive`, `hover:bg-theme-interactive-hover`, `text-theme-interactive`, `border-theme-interactive`, `ring-theme-interactive`
- **Borders:** `border-theme-strong`, `border-theme-subtle`
- **Semantic Backgrounds/Text:** `bg-theme-danger-subtle-bg`, `text-theme-danger-subtle-text`

---

## 4. Accessibility

- **Font Sizes:** The app supports dynamic font sizing via classes on the `<body>` (`font-size-sm`, `font-size-base`, etc.). Use relative units (`rem`, `em`) where possible.
- **Contrast:** Always use the theme color variables, as the High Contrast theme is specifically designed to meet WCAG AA/AAA contrast ratios.
- **Focus Management:** Ensure all interactive elements have clear focus states. Use `focus:ring-2 focus:ring-offset-2 ring-theme-interactive`. For modals and dialogs, ensure focus is trapped and returned to the trigger element on close.
- **ARIA Roles:** Use appropriate ARIA attributes (`aria-label`, `aria-expanded`, `role="dialog"`, etc.) to provide context to screen readers.

---

## 5. Icons

Icons are implemented as individual React components in `components/icons/`. They are SVGs that accept a `className` prop, allowing their size and color to be controlled via Tailwind utilities (e.g., `<PlusIcon className="w-5 h-5 text-current" />`).