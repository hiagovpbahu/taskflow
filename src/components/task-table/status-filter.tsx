'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useFilterStore } from '~/store/filterStore'
import type { TodoStatus } from '~/types/todo'

interface StatusOption {
  readonly value: string
  readonly label: string
}

interface StatusFilterProps {
  readonly statusOptions: StatusOption[]
}

export function StatusFilter({ statusOptions }: StatusFilterProps) {
  const selectedStatus = useFilterStore((state) => state.selectedStatus)
  const setSelectedStatus = useFilterStore((state) => state.setSelectedStatus)

  return (
    <Select
      value={selectedStatus}
      onValueChange={(value) => setSelectedStatus(value as TodoStatus)}
    >
      <SelectTrigger className='w-[140px]'>
        <SelectValue placeholder='Filter by status' />
      </SelectTrigger>
      <SelectContent>
        {statusOptions.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
