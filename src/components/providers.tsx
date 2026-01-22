import { ThemeProvider } from 'next-themes'
import { TRPCReactProvider } from '~/trpc/react'

export default function Providers({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <ThemeProvider attribute='class' defaultTheme='system' enableSystem>
      <TRPCReactProvider>{children}</TRPCReactProvider>
    </ThemeProvider>
  )
}
