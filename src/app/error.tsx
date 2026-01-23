'use client'

import { useEffect } from 'react'
import { Button } from '~/components/ui/button'

interface ErrorPageProps {
  readonly error: Error & { digest?: string }
  readonly reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error('Route error:', error)
  }, [error])

  return (
    <div className='flex min-h-screen flex-col items-center justify-center p-4'>
      <div className='w-full max-w-md space-y-4 text-center'>
        <h1 className='text-2xl font-bold text-destructive'>
          Something went wrong
        </h1>
        <p className='text-muted-foreground'>
          An unexpected error occurred in this route. Please try again or
          navigate back to the home page.
        </p>
        {process.env.NODE_ENV === 'development' && (
          <div className='rounded-md border border-destructive bg-destructive/10 p-4 text-left'>
            <p className='font-mono text-sm text-destructive'>
              {error.message}
            </p>
            {error.digest && (
              <p className='mt-2 text-xs text-muted-foreground'>
                Error ID: {error.digest}
              </p>
            )}
            {error.stack && (
              <details className='mt-2'>
                <summary className='cursor-pointer text-sm text-muted-foreground'>
                  Stack trace
                </summary>
                <pre className='mt-2 overflow-auto text-xs'>
                  {error.stack}
                </pre>
              </details>
            )}
          </div>
        )}
        <div className='flex gap-2 justify-center'>
          <Button onClick={reset} variant='outline'>
            Try again
          </Button>
          <Button
            onClick={() => {
              globalThis.location.href = '/'
            }}
          >
            Go to home
          </Button>
        </div>
      </div>
    </div>
  )
}
