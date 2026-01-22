import { z } from 'zod'

import { fetchJsonPlaceholder } from '~/lib/jsonPlaceholder'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import type { Todo } from '~/types/todo'

export const todoRouter = createTRPCRouter({
  getAll: publicProcedure.query(async (): Promise<Todo[]> => {
    return fetchJsonPlaceholder<Todo[]>('/todos')
  }),

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
