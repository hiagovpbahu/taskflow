'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'
import { StatusToggle } from '~/components/task-table/status-toggle'
import { Button } from '~/components/ui/button'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '~/components/ui/form'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { api } from '~/trpc/react'
import type { Todo } from '~/types/todo'

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  userId: z.number({ required_error: 'Please select a user' }),
  completed: z.boolean(),
})

type TaskFormValues = z.infer<typeof taskSchema>

interface TaskFormProps {
  readonly task?: Todo
}

export function TaskForm({ task }: TaskFormProps) {
  const router = useRouter()
  const utils = api.useUtils()
  const isEditMode = task !== undefined

  const { data: users, isLoading: isLoadingUsers } = api.user.getAll.useQuery()

  const createMutation = api.todo.create.useMutation({
    onSuccess: () => {
      void utils.todo.getAll.invalidate()
      toast.success('Task created successfully')
      router.push('/')
    },
    onError: (error) => {
      toast.error(`Failed to create task: ${error.message}`)
    },
  })

  const updateMutation = api.todo.update.useMutation({
    onSuccess: (_data, variables) => {
      if (!task) {
        return
      }

      const originalUserId = task.userId
      const originalCompleted = task.completed
      const newUserId = variables.userId ?? originalUserId
      const newCompleted = variables.completed ?? originalCompleted

      void utils.todo.getAll.invalidate(undefined, {
        predicate: (query) => {
          const input = query.queryKey[1] as
            | {
                userId?: number
                status?: 'all' | 'completed' | 'pending'
                page?: number
                pageSize?: number
              }
            | undefined

          if (!input) return true

          const matchesOriginalUserId =
            !input.userId || input.userId === originalUserId
          const matchesNewUserId = !input.userId || input.userId === newUserId

          const matchesOriginalStatus =
            !input.status ||
            input.status === 'all' ||
            (input.status === 'completed' && originalCompleted) ||
            (input.status === 'pending' && !originalCompleted)

          const matchesNewStatus =
            !input.status ||
            input.status === 'all' ||
            (input.status === 'completed' && newCompleted) ||
            (input.status === 'pending' && !newCompleted)

          return (
            (matchesOriginalUserId && matchesOriginalStatus) ||
            (matchesNewUserId && matchesNewStatus)
          )
        },
      })

      void utils.todo.getById.invalidate({ id: task.id })
      toast.success('Task updated successfully')
      router.push('/')
    },
    onError: (error) => {
      toast.error(`Failed to update task: ${error.message}`)
    },
  })

  const form = useForm<TaskFormValues>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: task?.title ?? '',
      userId: task?.userId,
      completed: task?.completed ?? false,
    },
    mode: 'onBlur',
  })

  useEffect(() => {
    if (task) {
      form.reset({
        title: task.title,
        userId: task.userId,
        completed: task.completed,
      })
    }
  }, [task, form])

  const onSubmit = (values: TaskFormValues) => {
    if (isEditMode && task) {
      updateMutation.mutate({
        id: task.id,
        title: values.title,
        userId: values.userId,
        completed: values.completed,
      })
    } else {
      createMutation.mutate({
        title: values.title,
        userId: values.userId,
        completed: values.completed,
      })
    }
  }

  const isSubmitting = createMutation.isPending || updateMutation.isPending
  const formValues = form.getValues()
  const hasErrors = Object.keys(form.formState.errors).length > 0
  const isFormValid =
    !hasErrors &&
    formValues.title.length >= 3 &&
    formValues.userId !== undefined

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className='space-y-6'
        noValidate
      >
        <FormField
          control={form.control}
          name='title'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  placeholder='Enter task title'
                  {...field}
                  aria-describedby='title-description title-error'
                  aria-invalid={form.formState.errors.title ? 'true' : 'false'}
                />
              </FormControl>
              <FormDescription id='title-description'>
                Task title must be at least 3 characters long
              </FormDescription>
              <FormMessage id='title-error' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='userId'
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assigned User</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(Number.parseInt(value, 10))
                }
                value={field.value ? field.value.toString() : undefined}
                disabled={isLoadingUsers}
              >
                <FormControl>
                  <SelectTrigger
                    className='w-full'
                    aria-describedby='user-description user-error'
                    aria-invalid={
                      form.formState.errors.userId ? 'true' : 'false'
                    }
                  >
                    <SelectValue placeholder='Select a user' />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {users?.map((user) => (
                    <SelectItem key={user.id} value={user.id.toString()}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription id='user-description'>
                Select the user who will be assigned to this task
              </FormDescription>
              <FormMessage id='user-error' />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name='completed'
          render={({ field }) => (
            <FormItem>
              <div className='flex flex-col gap-2'>
                <FormLabel>Status</FormLabel>
                <div className='flex items-center gap-3'>
                  <FormControl>
                    <StatusToggle
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      ariaLabel='Task completion status'
                    />
                  </FormControl>
                  <Label
                    htmlFor='status-toggle'
                    className='text-sm font-normal text-muted-foreground cursor-pointer'
                    onClick={() => field.onChange(!field.value)}
                  >
                    {field.value ? 'Completed' : 'Pending'}
                  </Label>
                </div>
              </div>
              <FormDescription>
                Set the initial status of the task (default: Pending)
              </FormDescription>
            </FormItem>
          )}
        />

        <div className='flex flex-col-reverse gap-3 pt-4 sm:flex-row sm:justify-end'>
          <Button
            type='button'
            variant='outline'
            onClick={() => router.push('/')}
            disabled={isSubmitting}
            className='w-full sm:w-auto'
          >
            Cancel
          </Button>
          <Button
            type='submit'
            disabled={!isFormValid || isSubmitting}
            className='w-full sm:w-auto'
          >
            {isSubmitting
              ? isEditMode
                ? 'Updating...'
                : 'Creating...'
              : isEditMode
                ? 'Update Task'
                : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
