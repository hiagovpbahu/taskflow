import type { Todo } from '~/types/todo'

type QueryParams = {
  readonly userId?: number | null
  readonly status?: 'all' | 'completed' | 'pending'
}

export const matchesUserId = (
  taskUserId: number,
  filterUserId: number | null | undefined,
): boolean => {
  return !filterUserId || filterUserId === taskUserId
}

export const matchesStatus = (
  taskCompleted: boolean,
  filterStatus: 'all' | 'completed' | 'pending',
): boolean => {
  return (
    filterStatus === 'all' ||
    (filterStatus === 'completed' && taskCompleted) ||
    (filterStatus === 'pending' && !taskCompleted)
  )
}

export const shouldIncludeTask = (
  task: Todo,
  queryParams: QueryParams,
): boolean => {
  return (
    matchesUserId(task.userId, queryParams.userId) &&
    matchesStatus(task.completed, queryParams.status ?? 'all')
  )
}
