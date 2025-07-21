/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Text
        primary: 'rgb(var(--color-text-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-text-secondary) / <alpha-value>)',
        subtle: 'rgb(var(--color-text-subtle) / <alpha-value>)',
        'on-interactive': 'rgb(var(--color-text-on-interactive) / <alpha-value>)',
        
        // Background
        surface: 'rgb(var(--color-bg-surface) / <alpha-value>)',
        background: 'rgb(var(--color-bg-background) / <alpha-value>)',
        'background-subtle': 'rgb(var(--color-bg-subtle) / <alpha-value>)',

        // Interactive
        interactive: {
            DEFAULT: 'rgb(var(--color-interactive) / <alpha-value>)',
            hover: 'rgb(var(--color-interactive-hover) / <alpha-value>)',
        },
        disabled: 'rgb(var(--color-disabled) / <alpha-value>)',

        // Semantic Colors
        danger: {
            DEFAULT: 'rgb(var(--color-danger) / <alpha-value>)',
            hover: 'rgb(var(--color-danger-hover) / <alpha-value>)',
            'subtle-bg': 'rgb(var(--color-danger-subtle-bg) / <alpha-value>)',
            'subtle-text': 'rgb(var(--color-danger-subtle-text) / <alpha-value>)',
        },
        success: {
            DEFAULT: 'rgb(var(--color-success) / <alpha-value>)',
            hover: 'rgb(var(--color-success-hover) / <alpha-value>)',
            'subtle-bg': 'rgb(var(--color-success-subtle-bg) / <alpha-value>)',
            'subtle-text': 'rgb(var(--color-success-subtle-text) / <alpha-value>)',
        },
        warning: {
            'subtle-bg': 'rgb(var(--color-warning-subtle-bg) / <alpha-value>)',
            'subtle-text': 'rgb(var(--color-warning-subtle-text) / <alpha-value>)',
        },
        info: {
            'subtle-bg': 'rgb(var(--color-info-subtle-bg) / <alpha-value>)',
            'subtle-text': 'rgb(var(--color-info-subtle-text) / <alpha-value>)',
        },
      },
      borderColor: theme => ({
        ...theme('colors'),
        DEFAULT: 'rgb(var(--color-border-strong) / <alpha-value>)',
        subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
        strong: 'rgb(var(--color-border-strong) / <alpha-value>)',
      }),
      ringColor: theme => ({
        ...theme('colors'),
        DEFAULT: 'rgb(var(--color-interactive) / <alpha-value>)',
      }),
      accentColor: theme => ({
          ...theme('colors'),
          DEFAULT: 'rgb(var(--color-interactive) / <alpha-value>)',
      }),
    },
  },
  plugins: [],
}