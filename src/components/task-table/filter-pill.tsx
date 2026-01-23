import { X } from 'lucide-react'
import { Badge } from '~/components/ui/badge'

interface ActiveFilterProps {
  readonly label: string
  readonly onRemove: () => void
}

export default function FilterPill({ label, onRemove }: ActiveFilterProps) {
  return (
    <Badge
      variant='secondary'
      className='gap-1.5 cursor-pointer hover:bg-secondary/60 dark:hover:bg-secondary/80 transition-colors'
      onClick={onRemove}
    >
      <span>{label}</span>
      <X className='h-3 w-3' aria-hidden='true' />
    </Badge>
  )
}
