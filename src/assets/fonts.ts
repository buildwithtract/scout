import { Fira_Sans, JetBrains_Mono, Poppins, Roboto } from 'next/font/google'

const FontTitle = Poppins({
  weight: ['400', '500', '600'],
  variable: '--font-title',
  subsets: ['latin']
})

const FontPrimary = Roboto({
  weight: ['400', '500', '700'],
  variable: '--font-primary',
  subsets: ['latin']
})

const FontSecondary = Fira_Sans({
  weight: ['400', '500', '600'],
  variable: '--font-secondary',
  subsets: ['latin']
})

const FontMono = JetBrains_Mono({
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  subsets: ['latin']
})

export const FontClassName = `${FontTitle.variable} ${FontPrimary.variable} ${FontSecondary.variable} ${FontMono.variable}`
