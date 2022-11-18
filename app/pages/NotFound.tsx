import { Error12Icon } from '@oxide/ui'

export default function NotFound() {
  return (
    <div className="flex w-full justify-center">
      <div
        className="fixed top-0 left-0 right-0 bottom-0 z-0 opacity-20"
        style={{
          backgroundImage:
            'linear-gradient(to bottom, var(--surface-error), var(--surface-default))',
        }}
      />
      <div className="absolute top-1/2 left-1/2 flex w-96 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center space-y-4 rounded border p-8 !bg-error-secondary border-error-tertiary elevation-3">
        <div className="my-2 flex flex inline-flex h-12 w-12 items-center justify-center">
          <div className="absolute h-12 w-12 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] rounded-full opacity-20 bg-destructive" />
          <Error12Icon className="relative h-8 w-8 text-error" />
        </div>

        <div className="space-y-1">
          <h1 className="text-center text-[32px] text-sans-light-2xl text-error">
            Page not found
          </h1>
          <p className="text-center text-error-tertiary">
            The page you are looking for doesn’t exist or you may not have access to it.
          </p>
        </div>
      </div>
    </div>
  )
}
