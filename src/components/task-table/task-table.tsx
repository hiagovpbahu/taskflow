'use client'

import { AlertCircle, Plus, X } from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { TaskForm } from '~/components/task-form'
import { Alert, AlertDescription, AlertTitle } from '~/components/ui/alert'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '~/components/ui/alert-dialog'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '~/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useFilterStore } from '~/store/filterStore'
import { api } from '~/trpc/react'
import type { Todo } from '~/types/todo'
import { ActiveFilters } from './active-filters'
import { StatusFilter } from './status-filter'
import { TaskRow } from './task-row'
import { TaskTableSkeleton } from './task-table-skeleton'
import { UserFilter } from './user-filter'

export function TaskTable() {
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [editingTask, setEditingTask] = useState<Todo | undefined>(undefined)

  const selectedUserId = useFilterStore((state) => state.selectedUserId)
  const selectedStatus = useFilterStore((state) => state.selectedStatus)
  const clearFilters = useFilterStore((state) => state.clearFilters)

  const {
    data: todosData,
    isLoading,
    error,
  } = api.todo.getAll.useQuery({
    userId: selectedUserId ?? undefined,
    status: selectedStatus,
  })

  const { data: users } = api.user.getAll.useQuery()
  const { data: statusOptions } = api.todo.getStatusOptions.useQuery()

  const utils = api.useUtils()

  const deleteMutation = api.todo.delete.useMutation({
    onMutate: async (variables) => {
      await utils.todo.getAll.cancel()

      const deletedTask = todos.find((todo) => todo.id === variables.id)

      if (!deletedTask) {
        return { previousData: null }
      }

      const previousData = utils.todo.getAll.getData({
        userId: selectedUserId ?? undefined,
        status: selectedStatus,
      })

      if (previousData) {
        utils.todo.getAll.setData(
          {
            userId: selectedUserId ?? undefined,
            status: selectedStatus,
          },
          {
            ...previousData,
            todos: previousData.todos.filter(
              (todo) => todo.id !== variables.id,
            ),
            total: Math.max(0, previousData.total - 1),
          },
        )
      }

      return { previousData, deletedTask }
    },
    onSuccess: (_data, variables) => {
      setDeletingTaskId(null)
      setShowDeleteDialog(false)
      void utils.todo.getById.invalidate({ id: variables.id })
      toast.success('Task deleted successfully')
    },
    onError: (error, _variables, context) => {
      setDeletingTaskId(null)
      setShowDeleteDialog(false)

      if (context?.previousData) {
        utils.todo.getAll.setData(
          {
            userId: selectedUserId ?? undefined,
            status: selectedStatus,
          },
          context.previousData,
        )
      }

      toast.error(`Failed to delete task: ${error.message}`)
    },
  })

  const updateMutation = api.todo.update.useMutation({
    onMutate: async ({ id, completed }) => {
      await utils.todo.getAll.cancel()

      const previousData = utils.todo.getAll.getData({
        userId: selectedUserId ?? undefined,
        status: selectedStatus,
      })

      if (previousData && completed !== undefined) {
        utils.todo.getAll.setData(
          {
            userId: selectedUserId ?? undefined,
            status: selectedStatus,
          },
          {
            ...previousData,
            todos: previousData.todos.map((todo) =>
              todo.id === id ? { ...todo, completed } : todo,
            ),
          },
        )
      }

      return { previousData }
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.todo.getAll.setData(
          {
            userId: selectedUserId ?? undefined,
            status: selectedStatus,
          },
          context.previousData,
        )
      }
      toast.error(`Failed to update task status: ${error.message}`)
    },
  })

  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)

  const todos = todosData?.todos ?? []

  const getUserById = useMemo(() => {
    const userMap = new Map(users?.map((user) => [user.id, user]))
    return (userId: number) => userMap.get(userId)
  }, [users])

  const handleEdit = useCallback(
    (taskId: number) => {
      const taskToEdit = todos.find((todo) => todo.id === taskId)
      if (taskToEdit) {
        setEditingTask(taskToEdit)
        setShowTaskDialog(true)
      }
    },
    [todos],
  )

  const handleCreate = useCallback(() => {
    setEditingTask(undefined)
    setShowTaskDialog(true)
  }, [])

  const handleCloseTaskDialog = useCallback(() => {
    setShowTaskDialog(false)
    setEditingTask(undefined)
  }, [])

  const handleDeleteClick = useCallback((taskId: number) => {
    setDeletingTaskId(taskId)
    setShowDeleteDialog(true)
  }, [])

  const handleDeleteConfirm = useCallback(() => {
    if (deletingTaskId) {
      deleteMutation.mutate({ id: deletingTaskId })
    }
  }, [deletingTaskId, deleteMutation])

  const handleStatusChange = useCallback(
    (taskId: number, completed: boolean) => {
      setUpdatingTaskId(taskId)
      updateMutation.mutate(
        { id: taskId, completed },
        {
          onSettled: () => {
            setUpdatingTaskId(null)
          },
        },
      )
    },
    [updateMutation],
  )

  const hasActiveFilters = selectedUserId !== null || selectedStatus !== 'all'

  if (error) {
    return (
      <Alert className='mt-4 border-destructive'>
        <AlertCircle className='h-4 w-4 text-destructive' />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          Failed to load tasks. Please try again later.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <>
      <div className='flex flex-col gap-4 mt-6 sm:flex-row sm:justify-between sm:items-center'>
        <h1 className='text-2xl font-semibold'>Task List View</h1>
        <Button
          type='button'
          onClick={handleCreate}
          className='bg-foreground text-background hover:bg-foreground/90 rounded-lg px-4 py-2 gap-2 font-medium'
        >
          <div className='flex h-5 w-5 items-center justify-center rounded-full bg-background'>
            <Plus className='h-3 w-3 text-foreground stroke-[2.5]' />
          </div>
          Quick Create
        </Button>
      </div>
      <div className='py-6 space-y-4'>
        <div className='flex flex-col gap-4'>
          <div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
            <div className='flex flex-wrap items-center gap-4'>
              <UserFilter users={users} />
              {statusOptions && <StatusFilter statusOptions={statusOptions} />}
            </div>
            {hasActiveFilters && (
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => {
                  clearFilters()
                }}
                className='gap-2'
              >
                <X className='h-4 w-4' />
                Clear Filters
              </Button>
            )}
          </div>
          {statusOptions && (
            <ActiveFilters users={users} statusOptions={statusOptions} />
          )}
        </div>
        <div className='rounded-md border overflow-hidden'>
          <div className='overflow-x-auto sm:overflow-visible'>
            <Table className='w-full'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[50px] sm:w-[70px]'>
                    Task ID
                  </TableHead>
                  <TableHead className='w-[80px]'>Set Status</TableHead>
                  <TableHead className='min-w-0'>
                    <span className='sm:hidden'>Task</span>
                    <span className='hidden sm:inline'>Title</span>
                  </TableHead>
                  <TableHead className='w-[140px] hidden sm:table-cell'>
                    Status
                  </TableHead>
                  <TableHead className='w-[180px] hidden md:table-cell'>
                    Assigned User
                  </TableHead>
                  <TableHead className='w-[60px] sm:w-[80px]'>
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              {isLoading ? (
                <TaskTableSkeleton rows={10} />
              ) : (
                <TableBody>
                  {todos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className='h-24 text-center'>
                        <p className='text-muted-foreground'>No tasks found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    todos.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        user={getUserById(task.userId)}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onStatusChange={handleStatusChange}
                        isDeleting={deletingTaskId === task.id}
                        isUpdatingStatus={updatingTaskId === task.id}
                      />
                    ))
                  )}
                </TableBody>
              )}
            </Table>
          </div>
        </div>
      </div>

      <AlertDialog
        open={showDeleteDialog}
        onOpenChange={(open) => {
          setShowDeleteDialog(open)
          if (!open) {
            setDeletingTaskId(null)
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this task? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteMutation.isPending}
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={showTaskDialog}
        onOpenChange={(open) => {
          if (!open) {
            handleCloseTaskDialog()
          }
        }}
      >
        <DialogContent className='max-w-2xl max-h-[90vh] overflow-y-auto'>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? 'Edit Task' : 'Create Task'}
            </DialogTitle>
            <DialogDescription>
              {editingTask
                ? 'Update the task details below.'
                : 'Fill in the details to create a new task.'}
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            task={editingTask}
            onClose={handleCloseTaskDialog}
            queryParams={{
              userId: selectedUserId,
              status: selectedStatus,
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
