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
        sage: {
          50: '#F4F7F4',
          100: '#E7EFE7',
          200: '#D2E1D2',
          300: '#B5CEB5',
          400: '#95B796',
          500: '#789F79',
          600: '#5F8260',
          700: '#4B674C',
          800: '#3D523E',
          900: '#344435',
          950: '#19251A',
        },
        forest: {
          700: '#223325',
          750: '#1D2B20',
          800: '#1A251D',
          850: '#141E17',
          900: '#0E1610',
          950: '#090E0B',
        },
        clay: {
          50: '#FDF8F5',
          100: '#F8ECE4',
          400: '#DDA17E',
          500: '#C77D58',
        }
      },
      borderWidth: {
        '3': '3px',
      },
      borderRadius: {
        'xs': '2px',
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out forwards',
        'slide-up': 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'pulse-subtle': 'pulseSubtle 2s infinite ease-in-out',
        'bounce-subtle': 'bounceSubtle 1.4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(4px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSubtle: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        }
      }
    },
  },
  plugins: [],
}
