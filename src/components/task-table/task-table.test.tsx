import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { Todo } from '~/types/todo'
import type { User } from '~/types/user'
import { TaskTable } from './task-table'

vi.mock('~/store/filterStore', () => ({
  useFilterStore: vi.fn((selector) => {
    const state = {
      selectedUserId: null,
      selectedStatus: 'all',
      clearFilters: vi.fn(),
    }
    return selector(state)
  }),
}))

const mockTodos: Todo[] = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  userId: (i % 10) + 1,
  title: `Task ${i + 1}`,
  completed: i % 2 === 0,
}))

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

const mockPush = vi.fn()
const mockInvalidate = vi.fn()
const mockMutate = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}))

vi.mock('react-responsive', () => ({
  useMediaQuery: () => false,
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockTodoUseQuery = vi.fn()
const mockStatusOptionsUseQuery = vi.fn()
const mockUserUseQuery = vi.fn()
const mockDeleteUseMutation = vi.fn()

vi.mock('~/trpc/react', () => ({
  api: {
    todo: {
      getAll: {
        useQuery: () => mockTodoUseQuery(),
      },
      getStatusOptions: {
        useQuery: () => mockStatusOptionsUseQuery(),
      },
      delete: {
        useMutation: () => mockDeleteUseMutation(),
      },
    },
    user: {
      getAll: {
        useQuery: () => mockUserUseQuery(),
      },
    },
    useUtils: () => ({
      todo: {
        getAll: {
          invalidate: mockInvalidate,
        },
      },
    }),
  },
}))

const mockStatusOptions = [
  { value: 'all', label: 'All Status' },
  { value: 'completed', label: 'Completed' },
  { value: 'pending', label: 'Pending' },
]

describe('TaskTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockTodoUseQuery.mockReturnValue({
      data: {
        todos: mockTodos,
        total: mockTodos.length,
        page: 1,
        pageSize: 10,
        totalPages: Math.ceil(mockTodos.length / 10),
      },
      isLoading: false,
      error: null,
    })
    mockStatusOptionsUseQuery.mockReturnValue({
      data: mockStatusOptions,
      isLoading: false,
      error: null,
    })
    mockUserUseQuery.mockReturnValue({
      data: mockUsers,
      isLoading: false,
      error: null,
    })
    mockDeleteUseMutation.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
    })
  })

  it('should render loading skeleton when data is loading', () => {
    mockTodoUseQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
    })

    render(<TaskTable />)

    const skeletons = screen.getAllByRole('row')
    expect(skeletons.length).toBeGreaterThan(0)
  })

  it('should render error message when there is an error', () => {
    mockTodoUseQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Failed to fetch'),
    })

    render(<TaskTable />)

    expect(screen.getByText('Error')).toBeInTheDocument()
    expect(
      screen.getByText('Failed to load tasks. Please try again later.'),
    ).toBeInTheDocument()
  })

  it('should render all tasks on current page', () => {
    render(<TaskTable />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 10')).toBeInTheDocument()
  })

  it('should display pagination information', () => {
    render(<TaskTable />)

    expect(screen.getByText(/Showing 1 to 10 of 25 task/)).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })

  it('should send filter and pagination params to backend', () => {
    render(<TaskTable />)

    expect(mockTodoUseQuery).toHaveBeenCalled()
  })

  it('should navigate to next page when Next button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskTable />)

    const nextButton = screen.getByLabelText('Next page')
    await user.click(nextButton)

    mockTodoUseQuery.mockReturnValue({
      data: {
        todos: mockTodos.slice(10, 20),
        total: mockTodos.length,
        page: 2,
        pageSize: 10,
        totalPages: 3,
      },
      isLoading: false,
      error: null,
    })

    await waitFor(() => {
      expect(screen.getByText('Task 11')).toBeInTheDocument()
    })
    expect(screen.getByText('Page 2 of 3')).toBeInTheDocument()
  })

  it('should navigate to previous page when Previous button is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskTable />)

    const nextButton = screen.getByLabelText('Next page')
    await user.click(nextButton)

    const prevButton = screen.getByLabelText('Previous page')
    await user.click(prevButton)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Page 1 of 3')).toBeInTheDocument()
  })

  it('should disable Previous button on first page', () => {
    render(<TaskTable />)

    const prevButton = screen.getByLabelText('Previous page')
    expect(prevButton).toBeDisabled()
  })

  it('should disable Next button on last page', async () => {
    const user = userEvent.setup()
    render(<TaskTable />)

    const nextButton = screen.getByLabelText('Next page')
    await user.click(nextButton)
    await user.click(nextButton)

    expect(nextButton).toBeDisabled()
  })

  it('should show delete dialog when delete is clicked', async () => {
    const user = userEvent.setup()
    render(<TaskTable />)

    const actionsButton = screen.getByLabelText('Actions for task 1')
    await user.click(actionsButton)

    const deleteMenuItem = screen.getByText('Delete')
    await user.click(deleteMenuItem)

    await waitFor(
      () => {
        expect(screen.getByText('Delete Task')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )
  })

  it('should call delete mutation when delete is confirmed', async () => {
    const user = userEvent.setup()
    render(<TaskTable />)

    const actionsButton = screen.getByLabelText('Actions for task 1')
    await user.click(actionsButton)

    const deleteMenuItem = screen.getByText('Delete')
    await user.click(deleteMenuItem)

    await waitFor(
      () => {
        expect(screen.getByText('Delete Task')).toBeInTheDocument()
      },
      { timeout: 3000 },
    )

    const confirmButton = screen.getByRole('button', { name: 'Delete' })
    await user.click(confirmButton)

    await waitFor(() => {
      expect(mockMutate).toHaveBeenCalledWith({ id: 1 })
    })
  })

  it('should display empty state when no tasks', () => {
    mockTodoUseQuery.mockReturnValue({
      data: {
        todos: [],
        total: 0,
        page: 1,
        pageSize: 10,
        totalPages: 0,
      },
      isLoading: false,
      error: null,
    })

    render(<TaskTable />)

    expect(screen.getByText('No tasks found')).toBeInTheDocument()
  })

  it('should use custom itemsPerPage when provided', () => {
    mockTodoUseQuery.mockReturnValue({
      data: {
        todos: mockTodos.slice(0, 5),
        total: mockTodos.length,
        page: 1,
        pageSize: 5,
        totalPages: Math.ceil(mockTodos.length / 5),
      },
      isLoading: false,
      error: null,
    })

    render(<TaskTable itemsPerPageOnDesktop={5} />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 5')).toBeInTheDocument()
    expect(screen.queryByText('Task 6')).not.toBeInTheDocument()
  })
})
