import { Skeleton } from '~/components/ui/skeleton'
import { TableBody, TableCell, TableRow } from '~/components/ui/table'

interface TaskTableSkeletonProps {
  readonly rows?: number
}

export function TaskTableSkeleton({ rows = 10 }: TaskTableSkeletonProps) {
  const rowNumbers = Array.from({ length: rows }, (_, index) => index + 1)

  return (
    <TableBody>
      {rowNumbers.map((rowNumber) => (
        <TableRow key={rowNumber}>
          <TableCell>
            <Skeleton className='h-4 w-12' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-full max-w-md' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-5 w-20' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell>
            <Skeleton className='h-8 w-8 rounded-full' />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
