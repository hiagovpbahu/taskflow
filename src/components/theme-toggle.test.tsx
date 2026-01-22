import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeProvider } from 'next-themes'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ThemeToggle } from './theme-toggle'

const mockSetTheme = vi.fn()

vi.mock('next-themes', async () => {
  const actual = await vi.importActual('next-themes')
  return {
    ...actual,
    useTheme: () => ({
      setTheme: mockSetTheme,
      theme: 'light',
    }),
  }
})

const renderWithTheme = (component: React.ReactElement) => {
  return render(
    <ThemeProvider attribute='class' defaultTheme='light' enableSystem={false}>
      {component}
    </ThemeProvider>,
  )
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render theme toggle button', () => {
    renderWithTheme(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' })
    expect(toggleButton).toBeInTheDocument()
  })

  it('should open dropdown menu when clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' })
    await user.click(toggleButton)

    expect(screen.getByText('Light')).toBeInTheDocument()
    expect(screen.getByText('Dark')).toBeInTheDocument()
    expect(screen.getByText('System')).toBeInTheDocument()
  })

  it('should call setTheme with "light" when Light option is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' })
    await user.click(toggleButton)

    const lightOption = screen.getByText('Light')
    await user.click(lightOption)

    expect(mockSetTheme).toHaveBeenCalledWith('light')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('should call setTheme with "dark" when Dark option is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' })
    await user.click(toggleButton)

    const darkOption = screen.getByText('Dark')
    await user.click(darkOption)

    expect(mockSetTheme).toHaveBeenCalledWith('dark')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('should call setTheme with "system" when System option is clicked', async () => {
    const user = userEvent.setup()
    renderWithTheme(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' })
    await user.click(toggleButton)

    const systemOption = screen.getByText('System')
    await user.click(systemOption)

    expect(mockSetTheme).toHaveBeenCalledWith('system')
    expect(mockSetTheme).toHaveBeenCalledTimes(1)
  })

  it('should have proper accessibility attributes', () => {
    renderWithTheme(<ThemeToggle />)

    const toggleButton = screen.getByRole('button', { name: 'Toggle theme' })
    expect(toggleButton).toHaveAttribute('type', 'button')
  })
})
