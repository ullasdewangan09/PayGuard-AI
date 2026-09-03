/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        obsidian: '#060709',
        carbon: '#0B0D12',
        surface: {
          DEFAULT: '#12151E',
          elevated: '#181C28',
          hover: '#1F2433'
        },
        cyan: {
          400: '#00F0FF',
          500: '#00D8E6',
        },
        app: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          tertiary: 'var(--bg-tertiary)',
          sidebar: 'var(--bg-sidebar)',
          textPrimary: 'var(--text-primary)',
          textSecondary: 'var(--text-secondary)',
          textMuted: 'var(--text-muted)',
          red: 'var(--accent-red)',
          green: 'var(--accent-green)',
          borderSubtle: 'var(--border-subtle)',
          borderMedium: 'var(--border-medium)',
          borderStrong: 'var(--border-strong)',
        }
      },
      fontFamily: {
        editorial: ['Outfit', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        sans: ['Manrope', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scanLine: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' }
        }
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease-out forwards',
        scanLine: 'scanLine 2.5s linear infinite',
      }
    },
  },
  plugins: [],
}
