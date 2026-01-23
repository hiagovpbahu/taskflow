'use client'

import { Component, type ReactNode } from 'react'
import { Button } from '~/components/ui/button'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className='flex min-h-screen flex-col items-center justify-center p-4'>
          <div className='w-full max-w-md space-y-4 text-center'>
            <h1 className='text-2xl font-bold text-destructive'>
              Something went wrong
            </h1>
            <p className='text-muted-foreground'>
              An unexpected error occurred. Please try refreshing the page or
              contact support if the problem persists.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className='rounded-md border border-destructive bg-destructive/10 p-4 text-left'>
                <p className='font-mono text-sm text-destructive'>
                  {this.state.error.message}
                </p>
                {this.state.error.stack && (
                  <details className='mt-2'>
                    <summary className='cursor-pointer text-sm text-muted-foreground'>
                      Stack trace
                    </summary>
                    <pre className='mt-2 overflow-auto text-xs'>
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            <div className='flex gap-2 justify-center'>
              <Button onClick={this.handleReset} variant='outline'>
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

    return this.props.children
  }
}
