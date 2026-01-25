'use client'

import type { LucideIcon } from 'lucide-react'
import { Home } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '~/lib/utils'
import { ThemeToggle } from './theme-toggle'

interface NavigationItem {
  readonly name: string
  readonly href: string
  readonly icon: LucideIcon
}

const navigation: NavigationItem[] = [
  { name: 'Task List', href: '/', icon: Home },
]

export default function SidebarContent() {
  const pathname = usePathname()

  return (
    <aside className='flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card px-6 pb-4'>
      <div className='flex h-16 shrink-0 items-center justify-between'>
        <Link
          href='/'
          className='flex items-center gap-3 font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1 -ml-2'
          aria-label='TaskFlow - Go to home'
        >
          <span>TaskFlow</span>
        </Link>
        <div className='hidden lg:block'>
          <ThemeToggle />
        </div>
      </div>
      <nav aria-label='Main navigation' className='flex flex-1 flex-col'>
        <ul className='flex flex-1 flex-col gap-y-1'>
          {navigation.map((item) => {
            const isActive = pathname === item.href
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  aria-current={isActive ? 'page' : undefined}
                  className={cn(
                    isActive
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                    'group flex gap-x-3 rounded-md p-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-center items-center',
                  )}
                >
                  <item.icon
                    className={cn(
                      isActive
                        ? 'text-accent-foreground'
                        : 'text-muted-foreground group-hover:text-accent-foreground',
                      'h-6 w-6 shrink-0',
                    )}
                    aria-hidden='true'
                  />
                  {item.name}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>
    </aside>
  )
}
