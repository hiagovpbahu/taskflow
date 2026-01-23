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
          <TableCell className='w-[50px] shrink-0 whitespace-nowrap text-center sm:text-left font-mono text-xs sm:w-[70px] sm:text-sm'>
            <Skeleton className='h-4 w-8' />
          </TableCell>
          <TableCell className='w-[80px] shrink-0 p-2 text-center'>
            <div className='flex items-center justify-center'>
              <Skeleton className='h-[1.15rem] w-8 rounded-full' />
            </div>
          </TableCell>
          <TableCell className='font-medium min-w-0 whitespace-normal'>
            <div className='flex flex-col gap-1.5'>
              <Skeleton className='h-4 w-full max-w-md' />
              <div className='flex flex-wrap items-center gap-2 sm:hidden'>
                <Skeleton className='h-5 w-16 rounded-full' />
                <Skeleton className='h-3 w-20' />
              </div>
            </div>
          </TableCell>
          <TableCell className='hidden sm:table-cell'>
            <Skeleton className='h-6 w-20' />
          </TableCell>
          <TableCell className='text-muted-foreground hidden md:table-cell'>
            <Skeleton className='h-4 w-24' />
          </TableCell>
          <TableCell className='flex w-[60px] h-full sm:w-[80px] shrink-0 items-center justify-center'>
            <Skeleton className='h-4 w-4 rounded-full' />
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  )
}
