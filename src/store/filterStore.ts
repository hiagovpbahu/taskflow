import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import type { TodoStatus } from '~/types/todo'

interface FilterState {
  selectedUserId: number | null
  selectedStatus: TodoStatus
  setSelectedUserId: (userId: number | null) => void
  setSelectedStatus: (status: TodoStatus) => void
  clearFilters: () => void
}

export const useFilterStore = create<FilterState>()(
  persist(
    (set) => ({
      selectedUserId: null,
      selectedStatus: 'all',
      setSelectedUserId: (userId) => set({ selectedUserId: userId }),
      setSelectedStatus: (status) => set({ selectedStatus: status }),
      clearFilters: () => set({ selectedUserId: null, selectedStatus: 'all' }),
    }),
    {
      name: 'taskflow-filters',
    },
  ),
)
