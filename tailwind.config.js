/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores semánticos del sistema de diseño
        background: 'rgb(var(--background))',
        foreground: 'rgb(var(--foreground))',
        
        card: 'rgb(var(--card))',
        'card-foreground': 'rgb(var(--card-foreground))',
        
        primary: {
          DEFAULT: 'rgb(var(--primary))',
          foreground: 'rgb(var(--primary-foreground))',
        },
        
        secondary: {
          DEFAULT: 'rgb(var(--secondary))',
          foreground: 'rgb(var(--secondary-foreground))',
        },
        
        muted: {
          DEFAULT: 'rgb(var(--muted))',
          foreground: 'rgb(var(--muted-foreground))',
        },
        
        destructive: {
          DEFAULT: 'rgb(var(--destructive))',
          foreground: 'rgb(var(--destructive-foreground))',
        },
        
        success: {
          DEFAULT: 'rgb(var(--success))',
          foreground: 'rgb(var(--success-foreground))',
        },
        
        warning: {
          DEFAULT: 'rgb(var(--warning))',
          foreground: 'rgb(var(--warning-foreground))',
        },
        
        info: {
          DEFAULT: 'rgb(var(--info))',
          foreground: 'rgb(var(--info-foreground))',
        },
        
        'accent-blue': {
          DEFAULT: 'rgb(var(--accent-blue))',
          foreground: 'rgb(var(--accent-blue-foreground))',
        },
        
        'accent-purple': {
          DEFAULT: 'rgb(var(--accent-purple))',
          foreground: 'rgb(var(--accent-purple-foreground))',
        },
        
        'accent-orange': {
          DEFAULT: 'rgb(var(--accent-orange))',
          foreground: 'rgb(var(--accent-orange-foreground))',
        },
        
        'accent-teal': {
          DEFAULT: 'rgb(var(--accent-teal))',
          foreground: 'rgb(var(--accent-teal-foreground))',
        },
        
        'accent-indigo': {
          DEFAULT: 'rgb(var(--accent-indigo))',
          foreground: 'rgb(var(--accent-indigo-foreground))',
        },
        
        'accent-pink': {
          DEFAULT: 'rgb(var(--accent-pink))',
          foreground: 'rgb(var(--accent-pink-foreground))',
        },
        
        'accent-cyan': {
          DEFAULT: 'rgb(var(--accent-cyan))',
          foreground: 'rgb(var(--accent-cyan-foreground))',
        },
        
        'accent-emerald': {
          DEFAULT: 'rgb(var(--accent-emerald))',
          foreground: 'rgb(var(--accent-emerald-foreground))',
        },
        
        'accent-violet': {
          DEFAULT: 'rgb(var(--accent-violet))',
          foreground: 'rgb(var(--accent-violet-foreground))',
        },
        
        ring: 'rgb(var(--ring))',
        input: 'rgb(var(--input))',
        'input-solid': 'rgb(var(--input-solid))',
        border: 'rgb(var(--border))',
        ring: 'rgb(var(--ring))',
        
        popover: {
          DEFAULT: 'rgb(var(--popover))',
          foreground: 'rgb(var(--popover-foreground))',
        },
        
        accent: {
          DEFAULT: 'rgb(var(--accent))',
          foreground: 'rgb(var(--accent-foreground))',
        },
        
        title: {
          DEFAULT: 'rgb(var(--title))',
          foreground: 'rgb(var(--title-foreground))',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif'
        ]
      }
    },
  },
  plugins: [],
}
