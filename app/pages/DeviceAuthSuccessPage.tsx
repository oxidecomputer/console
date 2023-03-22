import { Success12Icon } from '@oxide/ui'

/**
 * Device authorization success page
 */
export default function DeviceAuthSuccessPage() {
  return (
    <div className="flex w-full max-w-[470px] flex-col items-center rounded-lg border p-9 text-center !bg-raise border-secondary elevation-3">
      <div className="my-2 flex h-12 w-12 items-center justify-center">
        <div className="absolute h-12 w-12 rounded-full opacity-20 bg-accent motion-safe:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <Success12Icon className="relative h-8 w-8 text-accent" />
      </div>
      <h1 className="mt-4 text-sans-2xl text-accent">Success</h1>
      <p className="mt-1 text-sans-lg text-tertiary">Your device is now logged in</p>
    </div>
  )
}
