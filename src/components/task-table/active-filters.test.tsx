import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ActiveFilters } from './active-filters'
import type { User } from '~/types/user'

const mockUsers: User[] = [
  {
    id: 1,
    name: 'John Doe',
    username: 'johndoe',
    email: 'john@example.com',
    address: {
      street: '123 Main St',
      suite: 'Apt 1',
      city: 'New York',
      zipcode: '10001',
      geo: {
        lat: '40.7128',
        lng: '-74.0060',
      },
    },
    phone: '555-1234',
    website: 'johndoe.com',
    company: {
      name: 'Acme Corp',
      catchPhrase: 'Making things',
      bs: 'business',
    },
  },
]

const mockStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
]

const mockSetSelectedUserId = vi.fn()
const mockSetSelectedStatus = vi.fn()

let mockSelectedUserId: number | null = null
let mockSelectedStatus = 'all'

vi.mock('~/store/filterStore', () => ({
  useFilterStore: vi.fn((selector) => {
    const state = {
      get selectedUserId() {
        return mockSelectedUserId
      },
      get selectedStatus() {
        return mockSelectedStatus
      },
      setSelectedUserId: mockSetSelectedUserId,
      setSelectedStatus: mockSetSelectedStatus,
    }
    return selector(state)
  }),
}))

describe('ActiveFilters', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedUserId = null
    mockSelectedStatus = 'all'
  })

  it('should return null when no filters are active', () => {
    const { container } = render(
      <ActiveFilters users={mockUsers} statusOptions={mockStatusOptions} />,
    )

    expect(container.firstChild).toBeNull()
  })

  it('should display user filter pill when user is selected', () => {
    mockSelectedUserId = 1
    mockSelectedStatus = 'all'

    render(<ActiveFilters users={mockUsers} statusOptions={mockStatusOptions} />)

    expect(screen.getByText('User: John Doe')).toBeInTheDocument()
  })

  it('should display status filter pill when status is selected', () => {
    mockSelectedUserId = null
    mockSelectedStatus = 'completed'

    render(<ActiveFilters users={mockUsers} statusOptions={mockStatusOptions} />)

    expect(screen.getByText('Status: Completed')).toBeInTheDocument()
  })

  it('should display both filter pills when both filters are active', () => {
    mockSelectedUserId = 1
    mockSelectedStatus = 'pending'

    render(<ActiveFilters users={mockUsers} statusOptions={mockStatusOptions} />)

    expect(screen.getByText('User: John Doe')).toBeInTheDocument()
    expect(screen.getByText('Status: Pending')).toBeInTheDocument()
  })

  it('should call setSelectedUserId with null when user pill is clicked', async () => {
    const user = userEvent.setup()
    mockSelectedUserId = 1
    mockSelectedStatus = 'all'

    render(<ActiveFilters users={mockUsers} statusOptions={mockStatusOptions} />)

    const userPill = screen.getByText('User: John Doe').closest('span')
    if (userPill) {
      await user.click(userPill)
    }

    expect(mockSetSelectedUserId).toHaveBeenCalledWith(null)
  })

  it('should call setSelectedStatus with all when status pill is clicked', async () => {
    const user = userEvent.setup()
    mockSelectedUserId = null
    mockSelectedStatus = 'completed'

    render(<ActiveFilters users={mockUsers} statusOptions={mockStatusOptions} />)

    const statusPill = screen.getByText('Status: Completed').closest('span')
    if (statusPill) {
      await user.click(statusPill)
    }

    expect(mockSetSelectedStatus).toHaveBeenCalledWith('all')
  })

  it('should handle undefined users gracefully', () => {
    mockSelectedUserId = 1
    mockSelectedStatus = 'all'

    render(<ActiveFilters users={undefined} statusOptions={mockStatusOptions} />)

    expect(screen.queryByText('User: John Doe')).not.toBeInTheDocument()
  })
})
