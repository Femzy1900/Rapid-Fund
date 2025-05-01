
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
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
				},
				// Custom colors for our donation platform
				blue: {
					DEFAULT: '#3B82F6',
					50: '#EBF2FE',
					100: '#D7E6FD',
					200: '#B0CDFB',
					300: '#88B5F9',
					400: '#619CF8',
					500: '#3B82F6',
					600: '#0B61EF',
					700: '#084BBC',
					800: '#063589',
					900: '#042056',
				},
				orange: {
					DEFAULT: '#F97316',
					50: '#FEF2EA',
					100: '#FDE4D5',
					200: '#FBC9AB',
					300: '#FAAF82',
					400: '#F89458',
					500: '#F97316',
					600: '#D55C06',
					700: '#A14605',
					800: '#6D2F03',
					900: '#3A1902',
				},
				green: {
					DEFAULT: '#10B981',
					50: '#E7FBF4',
					100: '#CFF8EA',
					200: '#9FF1D9',
					300: '#6FEAC7',
					400: '#3FE2B5',
					500: '#10B981',
					600: '#0C9067',
					700: '#08674A',
					800: '#053E2D',
					900: '#021510',
				},
				red: {
					DEFAULT: '#EF4444',
					50: '#FDEEEE',
					100: '#FBDDDD',
					200: '#F8BBBB',
					300: '#F49999',
					400: '#F17777',
					500: '#EF4444',
					600: '#E71414',
					700: '#B30F0F',
					800: '#800B0B',
					900: '#4C0606',
				},
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
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.8' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite'
			},
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
