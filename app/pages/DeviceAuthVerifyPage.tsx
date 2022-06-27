import { useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Success16Icon, Warning12Icon } from '@oxide/ui'

import { useToast } from '../hooks'

/**
 * Device authorization verification page
 */
export default function DeviceAuthVerifyPage() {
  const [searchParams] = useSearchParams()
  const addToast = useToast()
  const confirmPost = useApiMutation('deviceAuthConfirm', {
    onSuccess: () => {
      addToast({
        title: 'Token authorized',
        icon: <Success16Icon />,
        timeout: 4000,
      })
    },
    onError: () => {
      addToast({
        title: 'Token denied',
        icon: <Warning12Icon />,
        variant: 'error',
        timeout: 4000,
      })
    },
  })
  const userCode = searchParams.get('user_code')

  return (
    <div className="space-y-4 bg-default">
      <h3 className="mb-2 text-center text-sans-2xl">Device authorization</h3>
      <h2 className="mb-2 text-center text-sans-2xl">User code: {userCode}</h2>
      <Button
        type="submit"
        className="w-full"
        disabled={confirmPost.isLoading}
        onClick={() => confirmPost.mutate({ body: { user_code: userCode } })}
      >
        Verify
      </Button>
    </div>
  )
}
