import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { TaskForm } from '~/components/task-form'
import { Button } from '~/components/ui/button'

export default function CreateTaskPage() {
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
        <h1 className='text-2xl font-semibold'>Create New Task</h1>
        <p className='text-sm text-muted-foreground mt-1'>
          Fill in the details below to create a new task
        </p>
      </div>

      <TaskForm />
    </div>
  )
}
