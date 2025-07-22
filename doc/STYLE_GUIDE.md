# Style Guide: Equity Scenario Simulator

## 1. Introduction

This style guide outlines the design principles, theming system, and CSS architecture for the Equity Scenario Simulator. Adhering to this guide ensures a consistent, accessible, and maintainable user interface.

The application uses **Tailwind CSS** for utility-first styling, enhanced by a custom CSS variable-based theming system.

---

## 2. Theming System

The core of the application's visual appearance is controlled by a theming system. This allows for global style changes (e.g., light mode, dark mode, high-contrast mode) without altering component-level class names.

### 2.1. Core Principles

- **CSS Variables:** All colors are defined as CSS variables (e.g., `--color-text-primary`) in `src/styles/index.css`.
- **RGB Channels:** Colors are defined as RGB channels (`R G B`) rather than hex codes. This allows for easy opacity modification using Tailwind's slash notation (e.g., `bg-interactive/50`).
- **Semantic Naming:** Components **must** use semantic utility classes (e.g., `bg-interactive`) instead of hard-coded Tailwind colors (e.g., `bg-blue-600`). This is the most critical rule for ensuring theme compatibility.

### 2.2. Available Themes

The application supports three themes, which are applied by adding a class to the `<body>` element.

| Class Name              | Theme Name      | Description                                |
|-------------------------|-----------------|--------------------------------------------|
| (none) or `.theme-classic`| **Classic**     | The default, clean, and professional theme.    |
| `.theme-modern`         | **Modern**      | A theme with subdued grays and an emerald accent. |
| `.theme-high-contrast`  | **High Contrast** | A dark theme designed for maximum readability. |

### 2.3. Key CSS Variables

These variables are defined in the `:root` and theme-specific blocks in `src/styles/index.css`.

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

## 3. Usage and Tailwind Configuration

To apply themes correctly, use the semantic color names defined in `tailwind.config.js`. These custom names are mapped to the CSS variables from `src/styles/index.css`.

**Do not use hard-coded Tailwind colors like `bg-blue-600` or `text-gray-500`.** Instead, use the semantic names like `bg-interactive` or `text-secondary`.

### 3.1. How it Works

Our `tailwind.config.js` maps semantic color names to our CSS variables:

```js
// tailwind.config.js (excerpt)
export default {
  theme: {
    extend: {
      colors: {
        // ...
        interactive: {
            DEFAULT: 'rgb(var(--color-interactive) / <alpha-value>)',
            hover: 'rgb(var(--color-interactive-hover) / <alpha-value>)',
        },
        // ...
      },
    },
  },
};
```

This allows you to use `bg-interactive`, `text-interactive`, `border-interactive`, and `hover:bg-interactive-hover` in your components. Tailwind will automatically apply the correct color based on the active theme.

### 3.2. Example: Creating a Themed Button

```jsx
// CORRECT: Uses semantic utility classes defined in tailwind.config.js
<button className="px-4 py-2 bg-interactive text-on-interactive rounded-md hover:bg-interactive-hover">
  Save
</button>

// INCORRECT: Uses hard-coded Tailwind colors, will not adapt to themes
<button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
  Save
</button>
```

### 3.3. Commonly Used Semantic Classes

Refer to `tailwind.config.js` for the full list.

- **Backgrounds:** `bg-background`, `bg-surface`, `bg-background-subtle`
- **Text:** `text-primary`, `text-secondary`, `text-subtle`, `text-on-interactive`
- **Interactivity:** `bg-interactive`, `hover:bg-interactive-hover`, `text-interactive`, `border-interactive`, `ring-interactive`
- **Borders:** `border-strong`, `border-subtle`
- **Semantic States:** `bg-danger-subtle-bg`, `text-danger-subtle-text`, `bg-success`

---

## 4. Accessibility

- **Font Sizes:** The app supports dynamic font sizing via classes on the `<body>` (`font-size-sm`, `font-size-base`, etc.). Use relative units (`rem`, `em`) where possible.
- **Contrast:** Always use the theme color variables, as the High Contrast theme is specifically designed to meet WCAG AA/AAA contrast ratios.
- **Focus Management:** Ensure all interactive elements have clear focus states. Use `focus:ring-2 focus:ring-offset-2 ring-interactive`. For modals and dialogs, ensure focus is trapped and returned to the trigger element on close.
- **ARIA Roles:** Use appropriate ARIA attributes (`aria-label`, `aria-expanded`, `role="dialog"`, etc.) to provide context to screen readers.

---

## 5. Icons

Icons are implemented as individual React components in `src/styles/icons/`. They are SVGs that accept a `className` prop, allowing their size and color to be controlled via Tailwind utilities (e.g., `<PlusIcon className="w-5 h-5 text-current" />`).
