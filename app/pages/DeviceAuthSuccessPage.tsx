import { Success16Icon } from '@oxide/ui'

/**
 * Device authorization success page
 */
export default function DeviceAuthSuccessPage() {
  return (
    <div className="space-y-4 max-w-sm text-center">
      <h1 className="text-sans-2xl">Device authentication</h1>
      <h2 className="text-sans-3xl flex items-center text-accent justify-center">
        <Success16Icon width={40} height={40} className="mr-3 text-accent" />
        Success!
      </h2>
      <p>Your device is now logged in.</p>
    </div>
  )
}
