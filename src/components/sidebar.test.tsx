import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Sidebar } from './sidebar'

vi.mock('next/navigation', () => ({
  usePathname: () => '/',
}))

vi.mock('./sidebar-content', () => ({
  default: () => <div data-testid='sidebar-content'>Sidebar Content</div>,
}))

vi.mock('./theme-toggle', () => ({
  ThemeToggle: () => (
    <button type='button' data-testid='theme-toggle'>
      Theme Toggle
    </button>
  ),
}))

describe('Sidebar', () => {
  it('should render mobile header with menu button', () => {
    render(<Sidebar />)

    const menuButton = screen.getByLabelText('Open navigation menu')
    expect(menuButton).toBeInTheDocument()
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })

  it('should render TaskFlow branding link', () => {
    render(<Sidebar />)

    const brandingLink = screen.getByLabelText('TaskFlow - Go to home')
    expect(brandingLink).toBeInTheDocument()
    expect(brandingLink).toHaveAttribute('href', '/')
  })

  it('should render theme toggle in mobile header', () => {
    render(<Sidebar />)

    const themeToggle = screen.getByTestId('theme-toggle')
    expect(themeToggle).toBeInTheDocument()
  })

  it('should update aria-expanded when menu is opened', async () => {
    const user = userEvent.setup()
    render(<Sidebar />)

    const menuButton = screen.getByLabelText('Open navigation menu')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')

    await user.click(menuButton)

    expect(menuButton).toHaveAttribute('aria-expanded', 'true')
  })

  it('should render desktop sidebar', () => {
    render(<Sidebar />)

    const desktopSidebar = screen.getByLabelText('Main navigation', {
      selector: 'aside',
    })
    expect(desktopSidebar).toBeInTheDocument()
    expect(desktopSidebar).toHaveClass('hidden', 'lg:fixed')
  })

  it('should have proper accessibility attributes', () => {
    render(<Sidebar />)

    const menuButton = screen.getByLabelText('Open navigation menu')
    expect(menuButton).toHaveAttribute('aria-controls', 'mobile-navigation')
    expect(menuButton).toHaveAttribute('aria-expanded', 'false')
  })
})
