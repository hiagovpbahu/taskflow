'use client'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { useFilterStore } from '~/store/filterStore'
import type { User } from '~/types/user'

interface UserFilterProps {
  readonly users: User[] | undefined
}

export function UserFilter({ users }: UserFilterProps) {
  const selectedUserId = useFilterStore((state) => state.selectedUserId)
  const setSelectedUserId = useFilterStore((state) => state.setSelectedUserId)

  return (
    <Select
      value={selectedUserId?.toString() ?? 'all'}
      onValueChange={(value) =>
        setSelectedUserId(value === 'all' ? null : Number.parseInt(value, 10))
      }
    >
      <SelectTrigger className='w-[180px]'>
        <SelectValue placeholder='Filter by user' />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value='all'>All Users</SelectItem>
        {users?.map((user) => (
          <SelectItem key={user.id} value={user.id.toString()}>
            {user.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
