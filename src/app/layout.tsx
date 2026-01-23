import '~/styles/globals.css'

import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import Providers from '~/components/providers'
import { Sidebar } from '~/components/sidebar'
import { Toaster } from '~/components/ui/sonner'

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
    <html
      lang='en'
      className={`${geist.variable} h-full`}
      suppressHydrationWarning
    >
      <body>
        <Providers>
          <div className='bg-background'>
            <Sidebar />
            <main className='lg:pl-72'>
              <div className='px-4 sm:px-6 lg:px-8'>{children}</div>
            </main>
          </div>
          <Toaster />
        </Providers>
      </body>
    </html>
  )
}
