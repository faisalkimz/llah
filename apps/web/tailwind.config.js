/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        /* Surface tokens - resolved via CSS custom properties for dark mode */
        canvas:             'var(--color-canvas)',
        'canvas-subtle':    'var(--color-canvas-subtle)',
        'canvas-overlay':   'var(--color-canvas-overlay)',
        surface:            'var(--color-surface)',
        'surface-raised':   'var(--color-surface-raised)',
        ink:                'var(--color-ink)',
        'ink-secondary':    'var(--color-ink-secondary)',
        muted:              'var(--color-muted)',
        'muted-foreground': 'var(--color-muted-foreground)',
        line:               'var(--color-line)',
        'line-strong':      'var(--color-line-strong)',

        /* Semantic */
        success:        'var(--color-success)',
        'success-muted':'var(--color-success-muted)',
        warning:        'var(--color-warning)',
        'warning-muted':'var(--color-warning-muted)',
        danger:         'var(--color-danger)',
        'danger-muted': 'var(--color-danger-muted)',
        info:           'var(--color-info)',
        'info-muted':   'var(--color-info-muted)',

        /* Brand accent */
        accent:         'var(--color-accent)',
        'accent-muted': 'var(--color-accent-muted)',
        'accent-strong':'var(--color-accent-strong)',
      },

      fontFamily: {
        sans:  ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono:  ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Consolas', 'monospace'],
      },

      fontSize: {
        'page-title': ['1.5rem',   { lineHeight: '2rem',   fontWeight: '600', letterSpacing: '-0.025em' }],
        'section':    ['1.125rem', { lineHeight: '1.75rem', fontWeight: '600', letterSpacing: '-0.015em' }],
        'body':       ['0.875rem', { lineHeight: '1.25rem', fontWeight: '400' }],
        'caption':    ['0.75rem',  { lineHeight: '1rem',    fontWeight: '400' }],
      },

      borderRadius: {
        DEFAULT: '6px',
        sm:      '4px',
        md:      '6px',
        lg:      '8px',
      },

      boxShadow: {
        'xs':      '0 1px 2px 0 rgb(0 0 0 / 0.03)',
        'sm':      '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.06)',
        'md':      '0 2px 4px -1px rgb(0 0 0 / 0.04), 0 4px 6px -1px rgb(0 0 0 / 0.06)',
        'lg':      '0 4px 6px -2px rgb(0 0 0 / 0.04), 0 10px 15px -3px rgb(0 0 0 / 0.06)',
        'overlay': '0 8px 24px -4px rgb(0 0 0 / 0.12), 0 0 0 1px rgb(0 0 0 / 0.04)',
      },

      spacing: {
        '4.5': '1.125rem',
        '13':  '3.25rem',
        '15':  '3.75rem',
        '18':  '4.5rem',
      },

      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-right': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'slide-in-bottom': {
          '0%':   { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%':   { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        'skeleton-pulse': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
        'spin': {
          '0%':   { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.5' },
        },
      },

      animation: {
        'fade-up':          'fade-up 0.2s ease-out',
        'fade-in':          'fade-in 0.15s ease-out',
        'slide-in-right':   'slide-in-right 0.25s ease-out',
        'slide-in-bottom':  'slide-in-bottom 0.25s ease-out',
        'scale-in':         'scale-in 0.15s ease-out',
        'skeleton':         'skeleton-pulse 1.5s ease-in-out infinite',
        'spin':             'spin 1s linear infinite',
        'pulse-slow':       'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },

      backgroundImage: {
        'grid-pattern': 'linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)',
      },
      backgroundSize: {
        'grid': '40px 40px',
      },
    },
  },
  plugins: [],
};
