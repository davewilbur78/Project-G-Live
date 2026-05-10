import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        display: ['Playfair Display', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        // Project-G design system -- matches prototype CSS variables
        ink: {
          DEFAULT: '#1a1410',
          mid: '#3d3228',
          soft: '#6b5c4e',
          faint: '#9c8878',
        },
        parchment: {
          DEFAULT: '#faf7f2',
          dark: '#f2ede4',
          darker: '#e8e0d3',
        },
        rule: {
          DEFAULT: '#d4c9b8',
          strong: '#b8a898',
        },
        gold: {
          DEFAULT: '#8b6914',
          light: '#f5ead0',
          mid: '#c8941e',
        },
        // Triage colors
        triage: {
          green: { ink: '#2d5a27', bg: '#edf5eb', rule: '#7ab373' },
          yellow: { ink: '#7a5200', bg: '#fef6e4', rule: '#d4a017' },
          red: { ink: '#7a1f1f', bg: '#fdf0f0', rule: '#c04040' },
          blue: { ink: '#1a3d5c', bg: '#eef4fb', rule: '#4a8ab5' },
        },
      },
    },
  },
  plugins: [],
}

export default config
