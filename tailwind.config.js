/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#0B0B0F',
        neonPurple: '#7B2CBF',
        magenta: '#F472B6',
        smoke: '#C4B5FD'
      },
      boxShadow: {
        glow: '0 0 20px rgba(123, 44, 191, 0.6)',
        magenta: '0 0 20px rgba(244, 114, 182, 0.4)'
      },
      backgroundImage: {
        'gradient-cta': 'linear-gradient(90deg, #7B2CBF 0%, #F472B6 100%)',
        'gradient-dark': 'linear-gradient(160deg, #0B0B0F 0%, #1D1027 50%, #0B0B0F 100%)',
        'gradient-purple-smoke': 'radial-gradient(circle at top, rgba(123,44,191,0.35), rgba(11,11,15,0.85) 70%)'
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0px rgba(123, 44, 191, 0.2)' },
          '50%': { boxShadow: '0 0 30px rgba(123, 44, 191, 0.8)' }
        },
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: 0.6 },
          '100%': { transform: 'scale(1.8)', opacity: 0 }
        },
        smokeRise: {
          '0%': { transform: 'translate3d(0, 20px, 0) scale(0.95)', opacity: 0 },
          '50%': { opacity: 0.9 },
          '100%': { transform: 'translate3d(0, -20px, 0) scale(1.05)', opacity: 0 }
        },
        drawLoading: {
          '0%': { transform: 'rotate3d(0.5, 0.7, 0.2, 0deg)' },
          '100%': { transform: 'rotate3d(0.5, 0.7, 0.2, 360deg)' }
        }
      },
      animation: {
        pulseGlow: 'pulseGlow 2.4s ease-in-out infinite',
        ripple: 'ripple 0.6s ease-out',
        smokeRise: 'smokeRise 3s ease-in-out infinite',
        drawLoading: 'drawLoading 1.6s linear infinite'
      }
    }
  },
  plugins: []
};
