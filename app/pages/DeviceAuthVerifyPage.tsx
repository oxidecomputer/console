import { useNavigate, useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Warning12Icon } from '@oxide/ui'

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
      navigate('/device/success')
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
    <div className="space-y-4 max-w-sm text-center">
      <h1 className="text-sans-2xl">Device authentication</h1>
      <p>Make sure this code matches the one shown on the device you are authenticating.</p>
      <h2 className="text-sans-3xl border p-4">{userCode}</h2>
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
