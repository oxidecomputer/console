import { Success16Icon } from '@oxide/ui'

/**
 * Device authorization success page
 */
export default function DeviceAuthSuccessPage() {
  return (
    <div className="max-w-sm space-y-4 text-center">
      <h1 className="text-sans-light-2xl">Device authentication</h1>
      <h2 className="text-sans-light-3xl flex items-center justify-center text-accent">
        <Success16Icon width={40} height={40} className="mr-3 text-accent" />
        Success!
      </h2>
      <p>Your device is now logged in.</p>
    </div>
  )
}
