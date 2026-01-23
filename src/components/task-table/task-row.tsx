'use client'

import { CheckCircle2, MoreVertical, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { TableCell, TableRow } from '~/components/ui/table'
import type { Todo } from '~/types/todo'
import type { User } from '~/types/user'

interface TaskRowProps {
  readonly task: Todo
  readonly user: User | undefined
  readonly onEdit: (task: Todo) => void
  readonly onDelete: (taskId: number) => void
  readonly isDeleting?: boolean
}

export function TaskRow({
  task,
  user,
  onEdit,
  onDelete,
  isDeleting = false,
}: TaskRowProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <TableRow>
      <TableCell className='w-[50px] shrink-0 whitespace-nowrap text-center sm:text-left font-mono text-muted-foreground text-xs sm:w-[100px] sm:text-sm'>
        #{task.id}
      </TableCell>
      <TableCell className='font-medium min-w-0 whitespace-normal wrap-break-word items-center justify-center'>
        <div className='flex flex-col gap-1.5'>
          <span>{task.title}</span>
          <div className='flex flex-wrap items-center gap-2 sm:hidden'>
            <Badge
              variant={task.completed ? 'default' : 'secondary'}
              className={
                task.completed
                  ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
              }
            >
              {task.completed ? (
                <>
                  <CheckCircle2 className='mr-1 h-3 w-3' aria-hidden='true' />
                  Completed
                </>
              ) : (
                <>
                  <XCircle className='mr-1 h-3 w-3' aria-hidden='true' />
                  Pending
                </>
              )}
            </Badge>
            <span className='text-xs text-muted-foreground'>
              {user?.name ?? 'Unassigned'}
            </span>
          </div>
        </div>
      </TableCell>
      <TableCell className='hidden sm:table-cell items-center'>
        <Badge
          variant={task.completed ? 'default' : 'secondary'}
          className={
            task.completed
              ? 'bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400'
              : 'bg-gray-100 text-gray-800 hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-300'
          }
        >
          {task.completed ? (
            <>
              <CheckCircle2 className='mr-1 h-3 w-3' aria-hidden='true' />
              Completed
            </>
          ) : (
            <>
              <XCircle className='mr-1 h-3 w-3' aria-hidden='true' />
              Pending
            </>
          )}
        </Badge>
      </TableCell>
      <TableCell className='text-muted-foreground hidden md:table-cell'>
        {user?.name ?? 'Unassigned'}
      </TableCell>
      <TableCell className='flex w-[60px] h-full sm:w-[80px] shrink-0 items-center justify-center'>
        <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 shrink-0'
              aria-label={`Actions for task ${task.id}`}
              disabled={isDeleting}
            >
              <MoreVertical className='h-4 w-4' aria-hidden='true' />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            <DropdownMenuItem
              onClick={() => {
                onEdit(task)
                setIsMenuOpen(false)
              }}
              disabled={isDeleting}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                onDelete(task.id)
                setIsMenuOpen(false)
              }}
              disabled={isDeleting}
              className='text-destructive focus:text-destructive'
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}
