/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchJsonPlaceholder } from '~/lib/jsonPlaceholder'
import { createCaller } from '~/server/api/root'
import type { Todo } from '~/types/todo'

vi.mock('~/lib/jsonPlaceholder')

const mockFetchJsonPlaceholder = vi.mocked(fetchJsonPlaceholder)

describe('todoRouter', () => {
  const createMockContext = () => ({
    headers: new Headers(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getStatusOptions', () => {
    it('should return all status options', async () => {
      const caller = createCaller(createMockContext)
      const result = await caller.todo.getStatusOptions()

      expect(result).toEqual([
        { value: 'all', label: 'All Status' },
        { value: 'completed', label: 'Completed' },
        { value: 'pending', label: 'Pending' },
      ])
    })
  })

  describe('getAll', () => {
    it('should fetch all todos', async () => {
      const mockTodos: Todo[] = [
        {
          id: 1,
          userId: 1,
          title: 'Test todo',
          completed: false,
        },
        {
          id: 2,
          userId: 2,
          title: 'Another todo',
          completed: true,
        },
      ]

      mockFetchJsonPlaceholder.mockResolvedValue(mockTodos)

      const caller = createCaller(createMockContext)
      const result = await caller.todo.getAll()

      expect(result.todos).toEqual(mockTodos)
      expect(result.total).toBe(2)
      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos')
    })

    it('should handle API errors', async () => {
      const error = new Error('API request failed: Not Found (404)')
      mockFetchJsonPlaceholder.mockRejectedValue(error)

      const caller = createCaller(createMockContext)

      await expect(caller.todo.getAll()).rejects.toThrow('API request failed')
    })
  })

  describe('getById', () => {
    it('should fetch a todo by id', async () => {
      const mockTodo: Todo = {
        id: 1,
        userId: 1,
        title: 'Test todo',
        completed: false,
      }

      mockFetchJsonPlaceholder.mockResolvedValue(mockTodo)

      const caller = createCaller(createMockContext)
      const result = await caller.todo.getById({ id: 1 })

      expect(result).toEqual(mockTodo)
      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos/1')
    })

    it('should validate input is a number', async () => {
      const caller = createCaller(createMockContext)

      await expect(
        caller.todo.getById({ id: 'invalid' as unknown as number }),
      ).rejects.toThrow()
    })
  })

  describe('create', () => {
    it('should create a new todo', async () => {
      const newTodo: Todo = {
        id: 201,
        userId: 1,
        title: 'New todo',
        completed: false,
      }

      mockFetchJsonPlaceholder.mockResolvedValue(newTodo)

      const caller = createCaller(createMockContext)
      const result = await caller.todo.create({
        title: 'New todo',
        userId: 1,
        completed: false,
      })

      expect(result).toEqual(newTodo)
      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New todo',
          userId: 1,
          completed: false,
        }),
      })
    })

    it('should use default completed value when not provided', async () => {
      const newTodo: Todo = {
        id: 201,
        userId: 1,
        title: 'New todo',
        completed: false,
      }

      mockFetchJsonPlaceholder.mockResolvedValue(newTodo)

      const caller = createCaller(createMockContext)
      await caller.todo.create({
        title: 'New todo',
        userId: 1,
      })

      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos', {
        method: 'POST',
        body: JSON.stringify({
          title: 'New todo',
          userId: 1,
          completed: false,
        }),
      })
    })

    it('should validate title minimum length', async () => {
      const caller = createCaller(createMockContext)

      await expect(
        caller.todo.create({
          title: 'ab',
          userId: 1,
        }),
      ).rejects.toThrow()
    })

    it('should validate userId is a number', async () => {
      const caller = createCaller(createMockContext)

      await expect(
        caller.todo.create({
          title: 'Valid title',
          userId: 'invalid' as unknown as number,
        }),
      ).rejects.toThrow()
    })
  })

  describe('update', () => {
    it('should update a todo', async () => {
      const updatedTodo: Todo = {
        id: 1,
        userId: 1,
        title: 'Updated todo',
        completed: true,
      }

      mockFetchJsonPlaceholder.mockResolvedValue(updatedTodo)

      const caller = createCaller(createMockContext)
      const result = await caller.todo.update({
        id: 1,
        title: 'Updated todo',
        completed: true,
      })

      expect(result).toEqual(updatedTodo)
      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos/1', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          title: 'Updated todo',
          completed: true,
        }),
      })
    })

    it('should update only provided fields', async () => {
      const updatedTodo: Todo = {
        id: 1,
        userId: 1,
        title: 'Original title',
        completed: true,
      }

      mockFetchJsonPlaceholder.mockResolvedValue(updatedTodo)

      const caller = createCaller(createMockContext)
      await caller.todo.update({
        id: 1,
        completed: true,
      })

      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos/1', {
        method: 'PUT',
        body: JSON.stringify({
          id: 1,
          completed: true,
        }),
      })
    })

    it('should validate title minimum length when provided', async () => {
      const caller = createCaller(createMockContext)

      await expect(
        caller.todo.update({
          id: 1,
          title: 'ab',
        }),
      ).rejects.toThrow()
    })
  })

  describe('delete', () => {
    it('should delete a todo', async () => {
      mockFetchJsonPlaceholder.mockResolvedValue(undefined)

      const caller = createCaller(createMockContext)
      await caller.todo.delete({ id: 1 })

      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/todos/1', {
        method: 'DELETE',
      })
    })

    it('should handle delete errors', async () => {
      const error = new Error('API request failed: Not Found (404)')
      mockFetchJsonPlaceholder.mockRejectedValue(error)

      const caller = createCaller(createMockContext)

      await expect(caller.todo.delete({ id: 999 })).rejects.toThrow(
        'API request failed',
      )
    })
  })
})
