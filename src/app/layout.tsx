import '~/styles/globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { ThemeProvider } from 'next-themes'

import { Toaster } from '~/components/ui/sonner'
import { TRPCReactProvider } from '~/trpc/react'

export const metadata: Metadata = {
  title: 'TaskFlow - Task Management Dashboard',
  description:
    'A modern task management dashboard built with React and TypeScript',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
}

const geist = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
})

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={geist.variable} suppressHydrationWarning>
      <body>
        <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
          <TRPCReactProvider>
            {children}
            <Toaster />
          </TRPCReactProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
