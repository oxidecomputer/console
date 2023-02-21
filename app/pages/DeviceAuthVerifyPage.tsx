import { useNavigate, useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Warning12Icon } from '@oxide/ui'

import { pb2 } from 'app/util/path-builder'

import { useToast } from '../hooks'

/**
 * Device authorization verification page
 */
export default function DeviceAuthVerifyPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const addToast = useToast()
  const confirmPost = useApiMutation('deviceAuthConfirm', {
    onSuccess: () => {
      navigate(pb2.deviceSuccess())
    },
    onError: () => {
      addToast({
        title: 'Token denied',
        icon: <Warning12Icon />,
        variant: 'error',
      })
    },
  })
  const userCode = searchParams.get('user_code')

  return (
    <div className="max-w-sm space-y-4 text-center">
      <h1 className="text-sans-2xl">Device authentication</h1>
      <p>Make sure this code matches the one shown on the device you are authenticating.</p>
      <h2 className="border p-4 text-sans-3xl">{userCode}</h2>
      <Button
        className="w-full"
        disabled={confirmPost.isLoading || confirmPost.isSuccess || !userCode}
        onClick={() => {
          // we know `userCode` is non-null because the button is disabled
          // otherwise, but let's make TS happy
          if (userCode) confirmPost.mutate({ body: { userCode } })
        }}
      >
        Log in on device
      </Button>
    </div>
  )
}
