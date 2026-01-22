'use client'

import { Plus } from 'lucide-react'
import Link from 'next/link'
import { Sidebar } from '~/components/sidebar'
import { Button } from '~/components/ui/button'

export default function Home() {
  return (
    <div className='min-h-screen bg-background'>
      <Sidebar />
      <main className='lg:pl-72'>
        <div className='px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between mt-8 text-center items-center'>
            <h1 className='text-2xl font-semibold'>Task List View</h1>
            <Button
              asChild
              type='button'
              className='bg-foreground text-background hover:bg-foreground/90 rounded-lg px-4 py-2 gap-2 font-medium'
            >
              <Link href='/create'>
                <div className='flex h-5 w-5 items-center justify-center rounded-full bg-background'>
                  <Plus className='h-3 w-3 text-foreground stroke-[2.5]' />
                </div>
                Quick Create
              </Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
