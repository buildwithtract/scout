import type { Config } from 'tailwindcss'

import tailwindcssAnimate from 'tailwindcss-animate'
import { fontFamily } from 'tailwindcss/defaultTheme'

const config = {
  darkMode: ['class'],
  content: [
    'src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: {
        '2xl': '1400px'
      }
    },
    extend: {
      screens: {
        xxs: '0px',
        xs: '375px',
        sm: '640px',
        md: '744px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      },
      borderColor: {
        DEFAULT: '#544c43'
      },
      fontFamily: {
        title: ['var(--font-title)'],
        primary: ['var(--font-primary)'],
        body: ['var(--font-primary)'],
        heading: ['var(--font-title)'],
        accent: ['var(--font-secondary)'],
        mono: ['var(--font-mono)', ...fontFamily.mono]
      },
      colors: {
        transparent: 'transparent',
        white: '#fff',
        // background: 'rgb(250,250,249)',
        text: '#0b0c0c',
        textSecondary: '#505a5f',
        link: '#1d70b8',
        linkHover: '#003078',
        linkVisited: '#4c2c92',
        linkActive: '#0b0c0c',
        // border: '#b1b4b6',
        inputBorder: '#0b0c0c',
        focus: '#ffdd00',
        focusText: '#0b0c0c',
        error: '#d4351c',
        success: '#00703c',
        brand: {
          primary: '#8ea75f',
          brown: '#544c43',
          cream: '#FEFCF2',
          alt: '#FFB097',
          em: '#75CDE0'
        },
        tints: {
          secondary: {
            blue: '#75CDE0',
            red: '#FF6433'
          },
          bg: '#f6f2e9',
          brown: {
            darker: '#36302a',
            light: '#8e8071',
            lighter: '#d2ccc6'
          },
          grey: {
            light: '#E2DFD8',
            lighter: '#F4F1E9'
          },
          green: {
            dark: '#61733F',
            light: '#B9C99C'
          },
          blue: {
            light: '#ACE1EC',
            dark: '#2690A6'
          },
          red: {
            light: '#FFB097',
            dark: '#B22B00'
          }
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        sidebar: {
          DEFAULT: 'hsl(var(--sidebar-background))',
          foreground: 'hsl(var(--sidebar-foreground))',
          primary: 'hsl(var(--sidebar-primary))',
          'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
          accent: 'hsl(var(--sidebar-accent))',
          'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
          border: 'hsl(var(--sidebar-border))',
          ring: 'hsl(var(--sidebar-ring))'
        }
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      },
      keyframes: {
        'accordion-down': {
          from: {
            height: '0'
          },
          to: {
            height: 'var(--radix-accordion-content-height)'
          }
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)'
          },
          to: {
            height: '0'
          }
        }
      },
      fontSize: {
        'head-1': '3.2rem',
        'head-2': '2rem',
        'head-3': '1.25rem',
        'head-4': '1rem',
        'subhead-1': '2.4rem',
        'subhead-2': '2rem',
        'subhead-3': '1.6rem',
        'subhead-4': '1.2rem',
        'accent-large': '2rem',
        'accent-small': '1.35rem',
        article: '1.15rem',
        'body-2': '0.75rem',
        'body-footnotes': '0.675rem',
        quote: '1.35rem',
        button: '0.8rem'
      }
    }
  },
  plugins: [tailwindcssAnimate]
} satisfies Config

export default config
