'use client'

import { zodResolver } from '@hookform/resolvers/zod'
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
import { shouldIncludeTask } from '~/lib/taskUtils'
import { api } from '~/trpc/react'
import type { Todo } from '~/types/todo'

const taskSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  userId: z.number({ required_error: 'Please select a user' }),
  completed: z.boolean(),
})

type TaskFormValues = z.infer<typeof taskSchema>

type QueryParams = {
  readonly userId?: number | null
  readonly status?: 'all' | 'completed' | 'pending'
}

interface TaskFormProps {
  readonly task?: Todo
  readonly onClose: () => void
  readonly queryParams?: QueryParams
}

export function TaskForm({ task, onClose, queryParams = {} }: TaskFormProps) {
  const utils = api.useUtils()
  const isEditMode = task !== undefined
  const queryInput = {
    userId: queryParams.userId ?? undefined,
    status: queryParams.status ?? 'all',
  }

  const { data: users, isLoading: isLoadingUsers } = api.user.getAll.useQuery()

  const createMutation = api.todo.create.useMutation({
    onMutate: async (variables) => {
      await utils.todo.getAll.cancel()

      const currentData = utils.todo.getAll.getData(queryInput)
      const maxId =
        currentData?.todos && currentData.todos.length > 0
          ? Math.max(...currentData.todos.map((todo) => todo.id))
          : 0
      const temporaryId = maxId > 0 ? maxId + 1 : Date.now()

      const optimisticTask: Todo = {
        id: temporaryId,
        title: variables.title,
        userId: variables.userId,
        completed: variables.completed ?? false,
      }

      if (currentData && shouldIncludeTask(optimisticTask, queryParams)) {
        utils.todo.getAll.setData(queryInput, {
          ...currentData,
          todos: [...currentData.todos, optimisticTask],
          total: currentData.total + 1,
        })
      }

      return { previousData: currentData, temporaryId }
    },
    onSuccess: (_data, variables, context) => {
      const finalTask: Todo = {
        id: _data.id,
        title: variables.title,
        userId: variables.userId,
        completed: variables.completed ?? false,
      }

      if (context?.temporaryId) {
        const currentData = utils.todo.getAll.getData(queryInput)
        if (currentData && shouldIncludeTask(finalTask, queryParams)) {
          const updatedTodos = currentData.todos.map((todo) =>
            todo.id === context.temporaryId ? finalTask : todo,
          )
          utils.todo.getAll.setData(queryInput, {
            ...currentData,
            todos: updatedTodos,
          })
        }
      }

      utils.todo.getById.setData({ id: finalTask.id }, finalTask)
      toast.success('Task created successfully')
      onClose()
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.todo.getAll.setData(queryInput, context.previousData)
      }
      toast.error(`Failed to create task: ${error.message}`)
    },
  })

  const updateMutation = api.todo.update.useMutation({
    onMutate: async (variables) => {
      if (!task) {
        return { previousData: null, previousGetByIdData: null }
      }

      await utils.todo.getAll.cancel()

      const optimisticTask: Todo = {
        ...task,
        ...(variables.title && { title: variables.title }),
        ...(variables.userId !== undefined && { userId: variables.userId }),
        ...(variables.completed !== undefined && {
          completed: variables.completed,
        }),
      }

      const previousData = utils.todo.getAll.getData(queryInput)
      const previousGetByIdData = utils.todo.getById.getData({ id: task.id })

      if (previousGetByIdData) {
        utils.todo.getById.setData({ id: task.id }, optimisticTask)
      }

      if (!previousData) {
        return { previousData, previousGetByIdData }
      }

      const taskExists = previousData.todos.some((todo) => todo.id === task.id)
      const originalMatches = shouldIncludeTask(task, queryParams)
      const newMatches = shouldIncludeTask(optimisticTask, queryParams)

      if (newMatches && taskExists) {
        const updatedTodos = previousData.todos.map((todo) =>
          todo.id === task.id ? optimisticTask : todo,
        )
        utils.todo.getAll.setData(queryInput, {
          ...previousData,
          todos: updatedTodos,
        })
        return { previousData, previousGetByIdData }
      }

      if (newMatches) {
        utils.todo.getAll.setData(queryInput, {
          ...previousData,
          todos: [...previousData.todos, optimisticTask],
          total: previousData.total + 1,
        })
        return { previousData, previousGetByIdData }
      }

      if (originalMatches && taskExists) {
        const updatedTodos = previousData.todos.filter(
          (todo) => todo.id !== task.id,
        )
        utils.todo.getAll.setData(queryInput, {
          ...previousData,
          todos: updatedTodos,
          total: Math.max(0, previousData.total - 1),
        })
      }

      return { previousData, previousGetByIdData }
    },
    onSuccess: (_data, variables, _context) => {
      if (!task) {
        return
      }

      const finalTask: Todo = {
        id: task.id,
        title: variables.title || task.title,
        userId: variables.userId ?? task.userId,
        completed: variables.completed ?? task.completed,
      }

      const currentData = utils.todo.getAll.getData(queryInput)
      if (currentData) {
        const taskIndex = currentData.todos.findIndex(
          (todo) => todo.id === task.id,
        )

        if (taskIndex !== -1) {
          const updatedTodos = currentData.todos.map((todo) =>
            todo.id === task.id ? finalTask : todo,
          )
          utils.todo.getAll.setData(queryInput, {
            ...currentData,
            todos: updatedTodos,
          })
        }
      }

      utils.todo.getById.setData({ id: task.id }, finalTask)
      toast.success('Task updated successfully')
      onClose()
    },
    onError: (error, _variables, context) => {
      if (context?.previousData) {
        utils.todo.getAll.setData(queryInput, context.previousData)
      }

      if (context?.previousGetByIdData && task) {
        utils.todo.getById.setData({ id: task.id }, context.previousGetByIdData)
      }

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
            onClick={onClose}
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
