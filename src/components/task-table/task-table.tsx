'use client'

import { AlertCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
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
import { api } from '~/trpc/react'
import { TaskRow } from './task-row'
import { TaskTableSkeleton } from './task-table-skeleton'

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

  const { data: todos, isLoading, error } = api.todo.getAll.useQuery()
  const { data: users } = api.user.getAll.useQuery()

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

  const getUserById = (userId: number) => {
    return users?.find((user) => user.id === userId)
  }

  const handleEdit = (taskId: number) => {
    router.push(`/edit/${taskId}`)
  }

  const handleDeleteClick = (taskId: number) => {
    setDeletingTaskId(taskId)
    setShowDeleteDialog(true)
  }

  const handleDeleteConfirm = () => {
    if (deletingTaskId) {
      deleteMutation.mutate({ id: deletingTaskId })
    }
  }

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

  const totalPages = todos ? Math.ceil(todos.length / itemsPerPage) : 0
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentTodos = todos?.slice(startIndex, endIndex) ?? []

  return (
    <>
      <div className='py-6 space-y-4'>
        <div className='rounded-md border overflow-hidden'>
          <div className='overflow-x-auto sm:overflow-visible'>
            <Table className='w-full'>
              <TableHeader>
                <TableRow>
                  <TableHead className='w-[60px] sm:w-[100px]'>
                    Task ID
                  </TableHead>
                  <TableHead className='min-w-0'>Title</TableHead>
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
                  {currentTodos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className='h-24 text-center'>
                        <p className='text-muted-foreground'>No tasks found</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentTodos.map((task) => (
                      <TaskRow
                        key={task.id}
                        task={task}
                        user={getUserById(task.userId)}
                        onEdit={(task) => handleEdit(task.id)}
                        onDelete={handleDeleteClick}
                        isDeleting={deletingTaskId === task.id}
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
              Showing {startIndex + 1} to {Math.min(endIndex, todos.length)} of{' '}
              {todos.length} task{todos.length === 1 ? '' : 's'}
            </div>
            <div className='flex items-center justify-center gap-2'>
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
