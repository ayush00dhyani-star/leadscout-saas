import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LeadScout - AI-Powered B2B Lead Generation',
  description: 'Find your next customer before your competitors do. Monitor Reddit and Twitter for buying intent signals with AI-powered lead scoring.',
  keywords: 'lead generation, B2B sales, social media monitoring, AI scoring, Reddit, Twitter',
  authors: [{ name: 'LeadScout Team' }],
  openGraph: {
    title: 'LeadScout - AI-Powered B2B Lead Generation',
    description: 'Find your next customer before your competitors do.',
    type: 'website',
    url: 'https://leadscout.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LeadScout - AI-Powered B2B Lead Generation',
    description: 'Find your next customer before your competitors do.',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}