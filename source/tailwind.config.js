/** DermiQ design tokens — see DESIGN_SYSTEM.md */
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        aubergine: { DEFAULT: '#211329', 900: '#1A0F21', 800: '#2A1A34', 700: '#372445', 600: '#48325A', 500: '#5E4772' },
        ink: { DEFAULT: '#17151C', 800: '#211F28', 700: '#2D2A36', 600: '#3D3947' },
        porcelain: { DEFAULT: '#F4F0E9', 200: '#EDE8DF', 300: '#E4DED3' },
        ivory: '#FBF9F5',
        brand: { DEFAULT: '#5B2393', 700: '#4B1C7B', 800: '#3D1766', 400: '#8257B4', 300: '#A98AD0', 200: '#C9B5E2' },
        lavender: { DEFAULT: '#DCD1E8', 100: '#F3EEF7', 200: '#EAE2F1', 400: '#C7B8D9' },
        stone: { DEFAULT: '#A7A19C', 100: '#EEEAE4', 200: '#E3DED6', 300: '#D2CCC4', 400: '#BDB7B0', 500: '#A7A19C', 600: '#857F7A', 700: '#68635F', 800: '#4A4643' },
        metal: { DEFAULT: '#B59A78', 300: '#D3C2AA', 600: '#96795A', 700: '#7A6146' },
        ok: { DEFAULT: '#2F6B55', bg: '#E2EEE8' },
        warn: { DEFAULT: '#82570E', bg: '#F5EAD3' },
        bad: { DEFAULT: '#9C3A3A', bg: '#F5E2DF' },
      },
      fontFamily: {
        sans: ['"Manrope Variable"', '"IBM Plex Sans Arabic"', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-display)'],
        mono: ['"IBM Plex Mono"', '"IBM Plex Sans Arabic"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
      },
      borderRadius: { xl2: '1.25rem', xl3: '1.75rem' },
      maxWidth: { page: '86rem', read: '42.5rem' },
      transitionTimingFunction: { precise: 'cubic-bezier(0.22, 0.61, 0.21, 1)' },
      boxShadow: {
        plate: '0 1px 0 rgba(33,19,41,0.04), 0 18px 40px -24px rgba(33,19,41,0.22)',
        lift: '0 30px 60px -30px rgba(33,19,41,0.35)',
      },
      keyframes: {
        'dot-pulse': { '0%, 100%': { opacity: '0.18', transform: 'scale(0.8)' }, '50%': { opacity: '1', transform: 'scale(1)' } },
        rise: { from: { opacity: '0', transform: 'translateY(18px)' }, to: { opacity: '1', transform: 'none' } },
        fade: { from: { opacity: '0' }, to: { opacity: '1' } },
        'sheet-up': { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'none' } },
        draw: { from: { transform: 'scaleX(0)' }, to: { transform: 'scaleX(1)' } },
      },
      animation: {
        'dot-pulse': 'dot-pulse 1.2s ease-in-out infinite',
        rise: 'rise 0.8s cubic-bezier(0.22,0.61,0.21,1) both',
        fade: 'fade 0.5s ease both',
        'sheet-up': 'sheet-up 0.32s cubic-bezier(0.22,0.61,0.21,1) both',
        draw: 'draw 1.1s cubic-bezier(0.22,0.61,0.21,1) both',
      },
    },
  },
  plugins: [],
};
