'use client'

import * as SwitchPrimitive from '@radix-ui/react-switch'

import { cn } from '~/lib/utils'

interface StatusToggleProps {
  readonly checked: boolean
  readonly onCheckedChange: (checked: boolean) => void
  readonly disabled?: boolean
  readonly ariaLabel?: string
}

export function StatusToggle({
  checked,
  onCheckedChange,
  disabled = false,
  ariaLabel,
}: StatusToggleProps) {
  return (
    <SwitchPrimitive.Root
      data-slot='status-toggle'
      checked={checked}
      onCheckedChange={onCheckedChange}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        'peer inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none hover:cursor-pointer focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50',
        'h-[1.15rem] w-8',
        'data-[state=checked]:bg-foreground/60 dark:data-[state=checked]:bg-foreground/50',
        'data-[state=unchecked]:bg-muted-foreground/30 dark:data-[state=unchecked]:bg-muted-foreground/20',
      )}
    >
      <SwitchPrimitive.Thumb
        data-slot='status-toggle-thumb'
        className={cn(
          'pointer-events-none block rounded-full ring-0 transition-transform',
          'size-4',
          'bg-background dark:bg-foreground',
          'data-[state=checked]:translate-x-[calc(100%-2px)]',
          'data-[state=unchecked]:translate-x-0',
        )}
      />
    </SwitchPrimitive.Root>
  )
}
