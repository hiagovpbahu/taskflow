'use client'

import { useState } from 'react'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { ThemeToggle } from '~/components/theme-toggle'
import { Button } from '~/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '~/components/ui/sheet'
import SidebarContent from './sidebar-content'

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <header className='sticky top-0 z-40 flex items-center gap-x-6 border-b bg-card px-4 py-4 shadow-sm lg:hidden'>
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button
              type='button'
              variant='ghost'
              size='icon'
              className='-m-2.5'
              aria-label='Open navigation menu'
              aria-expanded={isOpen}
              aria-controls='mobile-navigation'
            >
              <span className='sr-only'>Open sidebar</span>
              <Menu className='h-6 w-6' aria-hidden='true' />
            </Button>
          </SheetTrigger>
          <SheetContent
            side='left'
            className='w-72 p-0'
            id='mobile-navigation'
            aria-label='Main navigation'
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
        <div className='flex flex-1 items-center justify-between'>
          <Link
            href='/'
            className='text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded-md px-2 py-1 -ml-2'
            aria-label='TaskFlow - Go to home'
          >
            TaskFlow
          </Link>
          <ThemeToggle />
        </div>
      </header>
      <aside className='hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col' aria-label='Main navigation'>
        <SidebarContent />
      </aside>
    </>
  )
}
