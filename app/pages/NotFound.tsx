import { Link } from 'react-router-dom'

import { Error12Icon, PrevArrow12Icon } from '@oxide/ui'

export default function NotFound() {
  return (
    <div className="flex w-full justify-center">
      <div
        className="fixed top-0 left-0 right-0 bottom-0"
        style={{
          background:
            'radial-gradient(200% 100% at 50% 100%, var(--surface-default) 0%, #161B1D 100%)',
        }}
      />
      <div className="relative w-full">
        <Link
          to="/"
          className="flex items-center p-6 text-mono-sm text-secondary hover:text-default"
        >
          <PrevArrow12Icon title="Select" className="mr-2 w-2 text-tertiary" />
          Back to console
        </Link>
      </div>
      <div className="absolute top-1/2 left-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center space-y-4 rounded-lg border p-8 !bg-raise border-secondary elevation-3">
        <div className="my-2 flex h-12 w-12 items-center justify-center">
          <div className="absolute h-12 w-12 rounded-full opacity-20 bg-destructive motion-safe:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
          <Error12Icon className="relative h-8 w-8 text-error" />
        </div>

        <div className="space-y-2">
          <h1 className="text-center text-sans-2xl">Page not found</h1>
          <p className="text-center text-tertiary">
            The page you are looking for doesn&apos;t exist or you may not have access to
            it.
          </p>
        </div>
      </div>
    </div>
  )
}
