import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Surface hierarchy
        'pf-bg':           '#13131B',
        'pf-surface':      '#13131B',
        'pf-surface-low':  '#1B1B23',
        'pf-surface-base': '#1F1F28',
        'pf-surface-high': '#292932',
        'pf-surface-top':  '#34343D',
        'pf-surface-dim':  '#0D0D16',
        // Primary (Red)
        'pf-primary':        '#FFB3B1',
        'pf-primary-ctn':    '#FF535B',
        'pf-on-primary':     '#680011',
        'pf-on-primary-ctn': '#5B000E',
        'pf-inverse-primary':'#BB152C',
        // Secondary (Teal)
        'pf-secondary':        '#6FD8C8',
        'pf-secondary-ctn':    '#30A193',
        'pf-on-secondary':     '#003731',
        'pf-on-secondary-ctn': '#00302A',
        // Tertiary (Gold)
        'pf-tertiary':        '#E7C268',
        'pf-tertiary-ctn':    '#AD8D39',
        'pf-tertiary-fixed':  '#FFDF96',
        'pf-on-tertiary':     '#3E2E00',
        'pf-on-tertiary-fixed':'#251A00',
        // Text / on-surface
        'pf-on-surface':     '#E4E1ED',
        'pf-on-surface-var': '#E4BEBC',
        'pf-outline':        '#AB8987',
        'pf-outline-var':    '#5B403F',
        // Errors
        'pf-error':        '#FFB4AB',
        'pf-error-ctn':    '#93000A',
        'pf-on-error':     '#690005',
      },
      fontFamily: {
        display:  ['Epilogue', 'sans-serif'],
        body:     ['"Plus Jakarta Sans"', 'sans-serif'],
        mono:     ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        'pf-sm':   '8px',
        'pf-md':   '16px',
        'pf-lg':   '32px',
        'pf-full': '9999px',
      },
      backgroundImage: {
        'pf-hero-gradient': 'linear-gradient(135deg, #FF535B, #FFB3B1)',
        'pf-teal-gradient': 'linear-gradient(135deg, #30A193, #6FD8C8)',
        'pf-gold-gradient': 'linear-gradient(135deg, #AD8D39, #E7C268)',
      },
      boxShadow: {
        'pf-glow':   '0 0 20px -5px #FF535B80',
        'pf-float':  '0 16px 32px 0 rgba(228,225,237,0.06)',
        'pf-amber':  '0 0 20px -5px #E7C26880',
      },
      animation: {
        'pf-pulse-glow': 'pfPulse 2s ease-in-out infinite',
        'pf-fade-in':    'pfFadeIn 0.4s ease-out forwards',
        'pf-slide-up':   'pfSlideUp 0.5s ease-out forwards',
        'pf-badge-pop':  'pfBadgePop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s both',
        'pf-btn-pulse':  'pfBtnPulse 2.5s infinite ease-in-out',
      },
      keyframes: {
        pfPulse: {
          '0%, 100%': { boxShadow: '0 0 20px -5px #FF535B80' },
          '50%':       { boxShadow: '0 0 40px 5px #FF535BAA' },
        },
        pfFadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pfSlideUp: {
          '0%':   { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pfBadgePop: {
          '0%': { opacity: '0', transform: 'scale(0.7)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        pfBtnPulse: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.04)' },
        },
      },
    },
  },
  plugins: [],
}

export default config
