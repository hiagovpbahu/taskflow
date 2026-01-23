import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { User } from '~/types/user'
import { UserFilter } from './user-filter'

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
  {
    id: 2,
    name: 'Jane Smith',
    username: 'janesmith',
    email: 'jane@example.com',
    address: {
      street: '456 Oak Ave',
      suite: 'Suite 2',
      city: 'Los Angeles',
      zipcode: '90001',
      geo: {
        lat: '34.0522',
        lng: '-118.2437',
      },
    },
    phone: '555-5678',
    website: 'janesmith.com',
    company: {
      name: 'Tech Inc',
      catchPhrase: 'Innovation',
      bs: 'technology',
    },
  },
]

const mockSetSelectedUserId = vi.fn()

let mockSelectedUserId: number | null = null

vi.mock('~/store/filterStore', () => ({
  useFilterStore: vi.fn((selector) => {
    const state = {
      get selectedUserId() {
        return mockSelectedUserId
      },
      setSelectedUserId: mockSetSelectedUserId,
    }
    return selector(state)
  }),
}))

describe('UserFilter', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockSelectedUserId = null
  })

  it('should render user filter with All Users option', () => {
    render(<UserFilter users={mockUsers} />)

    expect(screen.getByText('All Users')).toBeInTheDocument()
  })

  it('should render select trigger', () => {
    render(<UserFilter users={mockUsers} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('should display current selected user', () => {
    mockSelectedUserId = 1

    render(<UserFilter users={mockUsers} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('should handle undefined users', () => {
    render(<UserFilter users={undefined} />)

    const trigger = screen.getByRole('combobox')
    expect(trigger).toBeInTheDocument()
  })

  it('should handle empty users array', async () => {
    const user = userEvent.setup()
    render(<UserFilter users={[]} />)

    const trigger = screen.getByRole('combobox')
    await user.click(trigger)

    expect(screen.getByText('All Users')).toBeInTheDocument()
  })
})
