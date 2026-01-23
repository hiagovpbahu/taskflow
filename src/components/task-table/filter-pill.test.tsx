import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import FilterPill from './filter-pill'

describe('FilterPill', () => {
  it('should render label', () => {
    const mockOnRemove = vi.fn()
    render(<FilterPill label='User: John Doe' onRemove={mockOnRemove} />)

    expect(screen.getByText('User: John Doe')).toBeInTheDocument()
  })

  it('should call onRemove when clicked', async () => {
    const user = userEvent.setup()
    const mockOnRemove = vi.fn()
    render(<FilterPill label='Status: Completed' onRemove={mockOnRemove} />)

    const pill = screen.getByText('Status: Completed').closest('span')
    if (pill) {
      await user.click(pill)
    }

    expect(mockOnRemove).toHaveBeenCalledTimes(1)
  })

  it('should have hover styles', () => {
    const mockOnRemove = vi.fn()
    const { container } = render(
      <FilterPill label='User: Test' onRemove={mockOnRemove} />,
    )

    const badge = container.querySelector('[data-slot="badge"]')
    expect(badge).toHaveClass('cursor-pointer')
    expect(badge).toHaveClass('hover:bg-secondary/60')
  })

  it('should display X icon', () => {
    const mockOnRemove = vi.fn()
    const { container } = render(
      <FilterPill label='Test Filter' onRemove={mockOnRemove} />,
    )

    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
    expect(icon).toHaveAttribute('aria-hidden', 'true')
  })
})
