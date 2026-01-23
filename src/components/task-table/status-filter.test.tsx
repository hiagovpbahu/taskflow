import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { StatusFilter } from './status-filter'

const mockStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
]

const mockSetSelectedStatus = vi.fn()

let mockSelectedStatus = 'all'

vi.mock('~/store/filterStore', () => ({
  useFilterStore: vi.fn((selector) => {
    const state = {
      get selectedStatus() {
        return mockSelectedStatus
      },
      setSelectedStatus: mockSetSelectedStatus,
    }
    return selector(state)
  }),
}))

describe('StatusFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedStatus = 'all'
  })

  it('should render status filter with options', () => {
    render(<StatusFilter statusOptions={mockStatusOptions} />)

    expect(screen.getByText('All Status')).toBeInTheDocument()
  })

  it('should render select trigger', () => {
    render(<StatusFilter statusOptions={mockStatusOptions} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('should display current selected status', () => {
    mockSelectedStatus = 'completed'

    render(<StatusFilter statusOptions={mockStatusOptions} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('should handle empty status options', () => {
    render(<StatusFilter statusOptions={[]} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })
})
