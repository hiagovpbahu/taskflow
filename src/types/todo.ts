export interface Todo {
  id: number
  userId: number
  title: string
  completed: boolean
}

export type TodoStatus = 'all' | 'completed' | 'pending'

export interface CreateTodoInput {
  title: string
  userId: number
  completed?: boolean
}

export interface UpdateTodoInput {
  title?: string
  userId?: number
  completed?: boolean
}
