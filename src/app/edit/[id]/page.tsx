import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { TaskForm } from '~/components/task-form'
import { Button } from '~/components/ui/button'
import { api } from '~/trpc/server'
import type { Todo } from '~/types/todo'

interface EditTaskPageProps {
  readonly params: Promise<{ id: string }>
}

export default async function EditTaskPage({ params }: EditTaskPageProps) {
  const { id } = await params
  const taskId = Number.parseInt(id, 10)

  if (Number.isNaN(taskId)) {
    notFound()
  }

  const task: Todo = await api.todo
    .getById({ id: taskId })
    .catch((error: unknown) => {
      console.error('Failed to fetch task:', error)
      notFound()
    })

  return (
    <div className='max-w-2xl mx-auto py-6 sm:py-8'>
      <div className='mb-6'>
        <Button
          asChild
          variant='ghost'
          size='sm'
          className='mb-4 -ml-2'
          type='button'
        >
          <Link href='/'>
            <ArrowLeft className='mr-2 h-4 w-4' />
            Back to Tasks
          </Link>
        </Button>
        <h1 className='text-2xl font-semibold'>Edit Task</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Update the task details below
        </p>
      </div>

      <TaskForm task={task} />
    </div>
  )
}
