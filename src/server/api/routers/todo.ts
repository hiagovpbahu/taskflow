import { z } from 'zod'

import { fetchJsonPlaceholder } from '~/lib/jsonPlaceholder'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import type { Todo } from '~/types/todo'

const todoFilterSchema = z
  .object({
    userId: z.number().nullable().optional(),
    status: z.enum(['all', 'completed', 'pending']).optional(),
  })
  .optional()

export const todoRouter = createTRPCRouter({
  getStatusOptions: publicProcedure.query(
    async (): Promise<Array<{ value: string; label: string }>> => {
      return [
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
      ]
    },
  ),

  getAll: publicProcedure.input(todoFilterSchema).query(
    async ({
      input,
    }): Promise<{
      todos: Todo[]
      total: number
    }> => {
      const todos = await fetchJsonPlaceholder<Todo[]>('/todos')

      let filteredTodos = todos

      if (input?.userId !== null && input?.userId !== undefined) {
        filteredTodos = filteredTodos.filter(
          (todo) => todo.userId === input.userId,
        )
      }

      if (input?.status && input.status !== 'all') {
        filteredTodos = filteredTodos.filter((todo) => {
          if (input.status === 'completed') {
            return todo.completed
          }
          if (input.status === 'pending') {
            return !todo.completed
          }
          return true
        })
      }

      return {
        todos: filteredTodos,
        total: filteredTodos.length,
      }
    },
  ),

  getById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }): Promise<Todo> => {
      return fetchJsonPlaceholder<Todo>(`/todos/${input.id}`)
    }),

  create: publicProcedure
    .input(
      z.object({
        title: z.string().min(3),
        userId: z.number(),
        completed: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ input }): Promise<Todo> => {
      return fetchJsonPlaceholder<Todo>('/todos', {
        method: 'POST',
        body: JSON.stringify(input),
      })
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(3).optional(),
        userId: z.number().optional(),
        completed: z.boolean().optional(),
      }),
    )
    .mutation(async ({ input }): Promise<Todo> => {
      const { id, ...updateData } = input
      return fetchJsonPlaceholder<Todo>(`/todos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ id, ...updateData }),
      })
    }),

  delete: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }): Promise<void> => {
      await fetchJsonPlaceholder<void>(`/todos/${input.id}`, {
        method: 'DELETE',
      })
    }),
})
