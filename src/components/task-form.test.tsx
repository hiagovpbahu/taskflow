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

const mockRouterPush = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockRouterPush,
  }),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('~/trpc/react', () => {
  const mockInvalidateFn = vi.fn()
  const mockGetByIdInvalidateFn = vi.fn()
  const createMutateFn = vi.fn((_variables, options) => {
    if (options?.onSuccess) {
      options.onSuccess()
    }
  })
  const updateMutateFn = vi.fn((variables, options) => {
    if (options?.onSuccess) {
      options.onSuccess(
        { id: 1, userId: 1, title: 'Test', completed: false },
        variables,
      )
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
        getAll: {
          invalidate: mockInvalidateFn,
        },
        getById: {
          invalidate: mockGetByIdInvalidateFn,
        },
      },
      useUtils: vi.fn(() => ({
        todo: {
          getAll: {
            invalidate: mockInvalidateFn,
          },
          getById: {
            invalidate: mockGetByIdInvalidateFn,
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
      invalidate: mockInvalidateFn,
      getByIdInvalidate: mockGetByIdInvalidateFn,
    },
  }
})

describe('Task Form', () => {
  describe('Rendering', () => {
    it('should render form in create mode', () => {
      render(<TaskForm />)
      expect(screen.getByLabelText('Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Assigned User')).toBeInTheDocument()
      expect(
        screen.getByRole('button', { name: 'Create Task' }),
      ).toBeInTheDocument()
    })

    it('should render form in edit mode', () => {
      render(<TaskForm task={mockTask} />)
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
      render(<TaskForm />)

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
      render(<TaskForm />)
      expect(screen.getByRole('button', { name: 'Create Task' })).toBeDisabled()
    })
  })

  describe('Navigation', () => {
    it('should navigate to home on cancel', async () => {
      const user = userEvent.setup()
      render(<TaskForm />)

      await user.click(screen.getByRole('button', { name: 'Cancel' }))
      expect(mockRouterPush).toHaveBeenCalledWith('/')
    })
  })

  describe('Status Toggle', () => {
    it('should toggle status when clicked', async () => {
      const user = userEvent.setup()
      render(<TaskForm />)

      expect(screen.getByText('Pending')).toBeInTheDocument()

      await user.click(screen.getByText('Pending'))

      await waitFor(() => {
        expect(screen.getByText('Completed')).toBeInTheDocument()
      })
    })
  })
})
