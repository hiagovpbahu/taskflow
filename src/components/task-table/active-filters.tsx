'use client'

import { useMemo } from 'react'
import { useFilterStore } from '~/store/filterStore'
import type { User } from '~/types/user'
import FilterPill from './filter-pill'

interface StatusOption {
  readonly value: string
  readonly label: string
}

interface ActiveFiltersProps {
  readonly users: User[] | undefined
  readonly statusOptions: StatusOption[]
}

export function ActiveFilters({ users, statusOptions }: ActiveFiltersProps) {
  const selectedUserId = useFilterStore((state) => state.selectedUserId)
  const selectedStatus = useFilterStore((state) => state.selectedStatus)
  const setSelectedUserId = useFilterStore((state) => state.setSelectedUserId)
  const setSelectedStatus = useFilterStore((state) => state.setSelectedStatus)

  const selectedUser = useMemo(
    () => users?.find((user) => user.id === selectedUserId),
    [users, selectedUserId],
  )
  const statusLabels = useMemo(
    () =>
      Object.fromEntries(
        statusOptions.map((option) => [option.value, option.label]),
      ),
    [statusOptions],
  )

  const hasActiveFilters = selectedUserId !== null || selectedStatus !== 'all'
  if (!hasActiveFilters) {
    return null
  }

  return (
    <div className='flex flex-wrap items-center gap-2'>
      {selectedUserId !== null && selectedUser && (
        <FilterPill
          label={`User: ${selectedUser.name}`}
          onRemove={() => setSelectedUserId(null)}
        />
      )}
      {selectedStatus !== 'all' && (
        <FilterPill
          label={`Status: ${statusLabels[selectedStatus]}`}
          onRemove={() => setSelectedStatus('all')}
        />
      )}
    </div>
  )
}
