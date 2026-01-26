import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import SidebarContent from './sidebar-content'

vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}))

vi.mock('./theme-toggle', () => ({
  ThemeToggle: () => (
    <button type='button' data-testid='theme-toggle'>
      Theme Toggle
    </button>
  ),
}))

const { usePathname } = await import('next/navigation')

describe('SidebarContent', () => {
  it('should render TaskFlow branding link', () => {
    render(<SidebarContent />)

    const brandingLink = screen.getByLabelText('TaskFlow - Go to home')
    expect(brandingLink).toBeInTheDocument()
    expect(brandingLink).toHaveAttribute('href', '/')
  })

  it('should render all navigation items', () => {
    render(<SidebarContent />)

    expect(screen.getByText('Task List')).toBeInTheDocument()
  })

  it('should mark active navigation item with aria-current="page"', () => {
    vi.mocked(usePathname).mockReturnValue('/')
    render(<SidebarContent />)

    const taskListLink = screen.getByRole('link', { name: /task list/i })
    expect(taskListLink).toHaveAttribute('aria-current', 'page')
  })


  it('should apply active styles to active navigation item', () => {
    vi.mocked(usePathname).mockReturnValue('/')
    render(<SidebarContent />)

    const taskListLink = screen.getByRole('link', { name: /task list/i })
    expect(taskListLink).toHaveClass('bg-accent', 'text-accent-foreground')
  })


  it('should have proper navigation landmark', () => {
    render(<SidebarContent />)

    const nav = screen.getByRole('navigation', { name: 'Main navigation' })
    expect(nav).toBeInTheDocument()
  })

  it('should render navigation links with correct hrefs', () => {
    render(<SidebarContent />)

    const taskListLink = screen.getByRole('link', { name: /task list/i })
    expect(taskListLink).toHaveAttribute('href', '/')
  })

  it('should hide icons from screen readers', () => {
    const { container } = render(<SidebarContent />)

    const icons = container.querySelectorAll('svg[aria-hidden="true"]')
    expect(icons.length).toBeGreaterThan(0)
    icons.forEach((icon) => {
      expect(icon).toHaveAttribute('aria-hidden', 'true')
    })
  })
})
