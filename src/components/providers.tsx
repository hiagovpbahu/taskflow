import { ThemeProvider } from 'next-themes'
import { TRPCReactProvider } from '~/trpc/react'
import { ErrorBoundary } from './error-boundary'

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ErrorBoundary>
      <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </ThemeProvider>
    </ErrorBoundary>
  )
}
