/**
 * @vitest-environment node
 */
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { fetchJsonPlaceholder } from '~/lib/jsonPlaceholder'
import { createCaller } from '~/server/api/root'
import type { User } from '~/types/user'

vi.mock('~/lib/jsonPlaceholder')

const mockFetchJsonPlaceholder = vi.mocked(fetchJsonPlaceholder)

describe('userRouter', () => {
  const createMockContext = () => ({
    headers: new Headers(),
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getAll', () => {
    it('should fetch all users', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          address: {
            street: '123 Main St',
            suite: 'Apt 1',
            city: 'New York',
            zipcode: '10001',
            geo: {
              lat: '40.7128',
              lng: '-74.0060',
            },
          },
          phone: '555-1234',
          website: 'johndoe.com',
          company: {
            name: 'Acme Corp',
            catchPhrase: 'Making things',
            bs: 'business',
          },
        },
        {
          id: 2,
          name: 'Jane Smith',
          username: 'janesmith',
          email: 'jane@example.com',
          address: {
            street: '456 Oak Ave',
            suite: 'Suite 2',
            city: 'Los Angeles',
            zipcode: '90001',
            geo: {
              lat: '34.0522',
              lng: '-118.2437',
            },
          },
          phone: '555-5678',
          website: 'janesmith.com',
          company: {
            name: 'Tech Inc',
            catchPhrase: 'Innovation',
            bs: 'technology',
          },
        },
      ]

      mockFetchJsonPlaceholder.mockResolvedValue(mockUsers)

      const caller = createCaller(createMockContext)
      const result = await caller.user.getAll()

      expect(result).toEqual(mockUsers)
      expect(mockFetchJsonPlaceholder).toHaveBeenCalledWith('/users')
    })

    it('should handle API errors', async () => {
      const error = new Error('API request failed: Internal Server Error (500)')
      mockFetchJsonPlaceholder.mockRejectedValue(error)

      const caller = createCaller(createMockContext)

      await expect(caller.user.getAll()).rejects.toThrow('API request failed')
    })

    it('should return empty array when API returns empty array', async () => {
      mockFetchJsonPlaceholder.mockResolvedValue([])

      const caller = createCaller(createMockContext)
      const result = await caller.user.getAll()

      expect(result).toEqual([])
    })
  })
})
