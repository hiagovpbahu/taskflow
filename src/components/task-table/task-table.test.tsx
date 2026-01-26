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

const mockInvalidate = vi.fn()
const mockMutate = vi.fn()

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
const mockUpdateUseMutation = vi.fn()

vi.mock('~/trpc/react', () => ({
  api: {
    todo: {
      getAll: {
        useQuery: () => mockTodoUseQuery(),
      },
      getStatusOptions: {
        useQuery: () => mockStatusOptionsUseQuery(),
      },
      update: {
        useMutation: () => mockUpdateUseMutation(),
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
          cancel: vi.fn(),
          getData: vi.fn(),
          setData: vi.fn(),
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
    mockUpdateUseMutation.mockReturnValue({
      mutate: vi.fn(),
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

  it('should render all tasks', () => {
    render(<TaskTable />)

    expect(screen.getByText('Task 1')).toBeInTheDocument()
    expect(screen.getByText('Task 25')).toBeInTheDocument()
  })

  it('should display responsive column headers', () => {
    render(<TaskTable />)

    expect(screen.getByText('Task ID')).toBeInTheDocument()
    expect(screen.getByText('Set Status')).toBeInTheDocument()
    expect(screen.getByText('Task')).toBeInTheDocument()
    expect(screen.getByText('Actions')).toBeInTheDocument()
  })

  it('should fetch all todos without filter params', () => {
    render(<TaskTable />)

    expect(mockTodoUseQuery).toHaveBeenCalled()
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
      },
      isLoading: false,
      error: null,
    })

    render(<TaskTable />)

    const emptyCell = screen.getByText('No tasks found').closest('td')
    expect(emptyCell).toHaveAttribute('colSpan', '6')
  })
})
