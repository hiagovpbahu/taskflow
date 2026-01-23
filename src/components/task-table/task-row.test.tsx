import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Table, TableBody } from '~/components/ui/table'
import type { Todo } from '~/types/todo'
import type { User } from '~/types/user'
import { TaskRow } from './task-row'

const renderTaskRow = (props: Parameters<typeof TaskRow>[0]) => {
  return render(
    <Table>
      <TableBody>
        <TaskRow {...props} />
      </TableBody>
    </Table>,
  )
}

const mockTask: Todo = {
  id: 1,
  userId: 1,
  title: 'Test task',
  completed: false,
}

const mockUser: User = {
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
}

describe('TaskRow', () => {
  const mockOnEdit = vi.fn()
  const mockOnDelete = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render task information', () => {
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    expect(screen.getByText('#1')).toBeInTheDocument()
    expect(screen.getByText('Test task')).toBeInTheDocument()
    expect(screen.getAllByText('John Doe').length).toBeGreaterThan(0)
  })

  it('should display completed status badge', () => {
    const completedTask: Todo = { ...mockTask, completed: true }
    renderTaskRow({
      task: completedTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    expect(screen.getAllByText('Completed').length).toBeGreaterThan(0)
  })

  it('should display pending status badge', () => {
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    expect(screen.getAllByText('Pending').length).toBeGreaterThan(0)
  })

  it('should display "Unassigned" when user is undefined', () => {
    renderTaskRow({
      task: mockTask,
      user: undefined,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    expect(screen.getAllByText('Unassigned').length).toBeGreaterThan(0)
  })

  it('should open actions menu when clicked', async () => {
    const user = userEvent.setup()
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    const actionsButton = screen.getByLabelText('Actions for task 1')
    await user.click(actionsButton)

    expect(screen.getByText('Edit')).toBeInTheDocument()
    expect(screen.getByText('Delete')).toBeInTheDocument()
  })

  it('should call onEdit when Edit is clicked', async () => {
    const user = userEvent.setup()
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    const actionsButton = screen.getByLabelText('Actions for task 1')
    await user.click(actionsButton)

    const editButton = screen.getByText('Edit')
    await user.click(editButton)

    expect(mockOnEdit).toHaveBeenCalledWith(1)
    expect(mockOnEdit).toHaveBeenCalledTimes(1)
  })

  it('should call onDelete when Delete is clicked', async () => {
    const user = userEvent.setup()
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    const actionsButton = screen.getByLabelText('Actions for task 1')
    await user.click(actionsButton)

    const deleteButton = screen.getByText('Delete')
    await user.click(deleteButton)

    expect(mockOnDelete).toHaveBeenCalledWith(1)
    expect(mockOnDelete).toHaveBeenCalledTimes(1)
  })

  it('should disable actions button when isDeleting is true', () => {
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
      isDeleting: true,
    })

    const actionsButton = screen.getByLabelText('Actions for task 1')
    expect(actionsButton).toBeDisabled()
  })

  it('should have proper accessibility attributes', () => {
    renderTaskRow({
      task: mockTask,
      user: mockUser,
      onEdit: mockOnEdit,
      onDelete: mockOnDelete,
    })

    const actionsButton = screen.getByLabelText('Actions for task 1')
    expect(actionsButton).toHaveAttribute('type', 'button')
  })
})
