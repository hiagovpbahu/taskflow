import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Todo } from '~/types/todo'
import { TaskForm } from './task-form'

const mockTask: Todo = {
  id: 1,
  userId: 1,
  title: 'Test Task',
  completed: false,
}

const mockOnClose = vi.fn()

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('~/trpc/react', () => {
  const mockGetData = vi.fn(() => null)
  const mockSetData = vi.fn()
  const mockCancel = vi.fn()
  const mockGetByIdGetData = vi.fn(() => null)
  const mockGetByIdSetData = vi.fn()
  const createMutateFn = vi.fn((_variables, options) => {
    if (options?.onMutate) {
      const context = options.onMutate(_variables)
      if (options?.onSuccess) {
        options.onSuccess(
          { id: 201, userId: _variables.userId, title: _variables.title, completed: _variables.completed ?? false },
          _variables,
          context,
        )
      }
    }
  })
  const updateMutateFn = vi.fn((variables, options) => {
    if (options?.onMutate) {
      const context = options.onMutate(variables)
      if (options?.onSuccess) {
        options.onSuccess(
          { id: 1, userId: variables.userId ?? 1, title: variables.title || 'Test', completed: variables.completed ?? false },
          variables,
          context,
        )
      }
    }
  })
  let createIsPending = false
  let updateIsPending = false

  const createMutationResult = {
    mutate: createMutateFn,
    get isPending() {
      return createIsPending
    },
  }

  const updateMutationResult = {
    mutate: updateMutateFn,
    get isPending() {
      return updateIsPending
    },
  }

  return {
    api: {
      user: {
        getAll: {
          useQuery: vi.fn(() => ({
            data: [
              { id: 1, name: 'John Doe' },
              { id: 2, name: 'Jane Smith' },
            ],
            isLoading: false,
          })),
        },
      },
      todo: {
        create: {
          useMutation: vi.fn(() => createMutationResult),
        },
        update: {
          useMutation: vi.fn(() => updateMutationResult),
        },
      },
      useUtils: vi.fn(() => ({
        todo: {
          getAll: {
            cancel: mockCancel,
            getData: mockGetData,
            setData: mockSetData,
          },
          getById: {
            getData: mockGetByIdGetData,
            setData: mockGetByIdSetData,
          },
        },
      })),
    },
    __mocks: {
      createMutate: createMutateFn,
      updateMutate: updateMutateFn,
      setCreateIsPending: (value: boolean) => {
        createIsPending = value
      },
      setUpdateIsPending: (value: boolean) => {
        updateIsPending = value
      },
      getData: mockGetData,
      setData: mockSetData,
      cancel: mockCancel,
      getByIdGetData: mockGetByIdGetData,
      getByIdSetData: mockGetByIdSetData,
    },
  }
})

describe('Task Form', () => {
  describe('Rendering', () => {
    it('should render form in create mode', () => {
      render(<TaskForm onClose={mockOnClose} />)
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Assigned User')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Create Task' }),
      ).toBeInTheDocument()
    })

    it('should render form in edit mode', () => {
      render(<TaskForm task={mockTask} onClose={mockOnClose} />)
      expect(
        screen.getByRole('button', { name: 'Update Task' }),
      ).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter task title')).toHaveValue(
        'Test Task',
      )
    })
  })

  describe('Validation', () => {
    it('should show error for title less than 3 characters', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} />)

      const titleInput = screen.getByPlaceholderText('Enter task title')
      await user.type(titleInput, 'Ab')
      await user.tab()

      await waitFor(() => {
        expect(
          screen.getByText('Title must be at least 3 characters'),
        ).toBeInTheDocument()
      })
    })

    it('should disable submit when form is invalid', () => {
      render(<TaskForm onClose={mockOnClose} />)
      expect(screen.getByRole('button', { name: 'Create Task' })).toBeDisabled()
    })
  })

  describe('Modal behavior', () => {
    it('should call onClose when cancel is clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(mockOnClose).toHaveBeenCalled()
    })
  })

  describe('Status Toggle', () => {
    it('should toggle status when clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm onClose={mockOnClose} />)

      expect(screen.getByText('Pending')).toBeInTheDocument()

      await user.click(screen.getByText('Pending'))

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })
  })
})
