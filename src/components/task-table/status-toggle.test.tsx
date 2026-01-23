import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusToggle } from './status-toggle'

describe('StatusToggle', () => {
  const mockOnCheckedChange = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render toggle', () => {
    render(
      <StatusToggle
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    expect(toggle).toBeInTheDocument()
  })

  it('should be checked when checked prop is true', () => {
    render(
      <StatusToggle
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    expect(toggle).toBeChecked()
  })

  it('should be unchecked when checked prop is false', () => {
    render(
      <StatusToggle
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    expect(toggle).not.toBeChecked()
  })

  it('should call onCheckedChange when clicked', async () => {
    const user = userEvent.setup()
    render(
      <StatusToggle
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    await user.click(toggle)

    expect(mockOnCheckedChange).toHaveBeenCalledWith(true)
    expect(mockOnCheckedChange).toHaveBeenCalledTimes(1)
  })

  it('should call onCheckedChange with false when unchecking', async () => {
    const user = userEvent.setup()
    render(
      <StatusToggle
        checked={true}
        onCheckedChange={mockOnCheckedChange}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    await user.click(toggle)

    expect(mockOnCheckedChange).toHaveBeenCalledWith(false)
    expect(mockOnCheckedChange).toHaveBeenCalledTimes(1)
  })

  it('should be disabled when disabled prop is true', () => {
    render(
      <StatusToggle
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        disabled={true}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    expect(toggle).toBeDisabled()
  })

  it('should not call onCheckedChange when disabled and clicked', async () => {
    const user = userEvent.setup()
    render(
      <StatusToggle
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        disabled={true}
        ariaLabel='Toggle status'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status')
    await user.click(toggle)

    expect(mockOnCheckedChange).not.toHaveBeenCalled()
  })

  it('should have proper aria-label', () => {
    render(
      <StatusToggle
        checked={false}
        onCheckedChange={mockOnCheckedChange}
        ariaLabel='Toggle status for task 1'
      />,
    )

    const toggle = screen.getByLabelText('Toggle status for task 1')
    expect(toggle).toBeInTheDocument()
  })
})
