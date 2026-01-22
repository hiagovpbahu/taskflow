import { fetchJsonPlaceholder } from '~/lib/jsonPlaceholder'
import { createTRPCRouter, publicProcedure } from '~/server/api/trpc'
import type { User } from '~/types/user'

export const userRouter = createTRPCRouter({
  getAll: publicProcedure.query(async (): Promise<User[]> => {
    return fetchJsonPlaceholder<User[]>('/users')
  }),
})
