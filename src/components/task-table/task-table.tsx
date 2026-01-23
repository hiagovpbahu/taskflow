'use client'

import { AlertCircle, ChevronFirst, ChevronLast, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useMediaQuery } from 'react-responsive'
import { toast } from 'sonner'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { useFilterStore } from '~/store/filterStore'
import { api } from '~/trpc/react'
import { ActiveFilters } from './active-filters'
import { StatusFilter } from './status-filter'
import { TaskRow } from './task-row'
import { TaskTableSkeleton } from './task-table-skeleton'
import { UserFilter } from './user-filter'

interface TaskTableProps {
  itemsPerPageOnDesktop?: number
  itemsPerPageOnMobile?: number
}

export function TaskTable({
  itemsPerPageOnMobile = 5,
  itemsPerPageOnDesktop = 10,
}: Readonly<TaskTableProps>) {
  const router = useRouter()
  const isMobile = useMediaQuery({ query: '(max-width: 640px)' })
  const itemsPerPage = isMobile ? itemsPerPageOnMobile : itemsPerPageOnDesktop
  const [currentPage, setCurrentPage] = useState(1)
  const [deletingTaskId, setDeletingTaskId] = useState<number | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

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
    page: currentPage,
    pageSize: itemsPerPage,
  })

  const { data: users } = api.user.getAll.useQuery()
  const { data: statusOptions } = api.todo.getStatusOptions.useQuery()

  const utils = api.useUtils()

  const deleteMutation = api.todo.delete.useMutation({
    onSuccess: () => {
      setDeletingTaskId(null)
      setShowDeleteDialog(false)
      void utils.todo.getAll.invalidate()
      toast.success('Task deleted successfully')
    },
    onError: (error) => {
      setDeletingTaskId(null)
      setShowDeleteDialog(false)
      toast.error(`Failed to delete task: ${error.message}`)
    },
  })

  const updateMutation = api.todo.update.useMutation({
    onMutate: async ({ id, completed }) => {
      await utils.todo.getAll.cancel()

      const previousData = utils.todo.getAll.getData({
        userId: selectedUserId ?? undefined,
        status: selectedStatus,
        page: currentPage,
        pageSize: itemsPerPage,
      })

      if (previousData && completed !== undefined) {
        utils.todo.getAll.setData(
          {
            userId: selectedUserId ?? undefined,
            status: selectedStatus,
            page: currentPage,
            pageSize: itemsPerPage,
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
            page: currentPage,
            pageSize: itemsPerPage,
          },
          context.previousData,
        )
      }
      toast.error(`Failed to update task status: ${error.message}`)
    },
  })

  const [updatingTaskId, setUpdatingTaskId] = useState<number | null>(null)

  const todos = todosData?.todos ?? []
  const totalTodos = todosData?.total ?? 0
  const totalPages = todosData?.totalPages ?? 0

  const getUserById = useMemo(() => {
    const userMap = new Map(users?.map((user) => [user.id, user]))
    return (userId: number) => userMap.get(userId)
  }, [users])

  const handleEdit = useCallback(
    (taskId: number) => {
      router.push(`/edit/${taskId}`)
    },
    [router],
  )

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

  useEffect(() => {
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1)
    }
  }, [currentPage, totalPages])

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
                <TaskTableSkeleton rows={itemsPerPage} />
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

        {!isLoading && todos && todos.length > 0 && (
          <div className='flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between'>
            <div className='text-sm text-muted-foreground'>
              Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, totalTodos)} of {totalTodos}{' '}
              task{totalTodos === 1 ? '' : 's'}
            </div>
            <div className='flex items-center justify-center gap-2'>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                aria-label='First page'
              >
                <ChevronFirst className='h-4 w-4' />
                <span className='sr-only sm:not-sr-only sm:ml-1'>First</span>
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                aria-label='Previous page'
              >
                Previous
              </Button>
              <span className='text-sm text-muted-foreground'>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() =>
                  setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                }
                disabled={currentPage === totalPages}
                aria-label='Next page'
              >
                Next
              </Button>
              <Button
                type='button'
                variant='outline'
                size='sm'
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                aria-label='Last page'
              >
                <span className='sr-only sm:not-sr-only sm:mr-1'>Last</span>
                <ChevronLast className='h-4 w-4' />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
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
    </>
  )
}
