import { useSearchParams } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Success16Icon, Warning12Icon } from '@oxide/ui'

import { useToast } from '../hooks'

/**
 * Client verification success page
 */
export default function ClientVerifyPage() {
  const [searchParams] = useSearchParams()
  const addToast = useToast()
  const confirmPost = useApiMutation('clientConfirm', {
    onSuccess: () => {
      addToast({
        title: 'Client verified',
        icon: <Success16Icon />,
        timeout: 4000,
      })
    },
    onError: () => {
      addToast({
        title: 'Verification failed',
        icon: <Warning12Icon />,
        variant: 'error',
        timeout: 4000,
      })
    },
  })
  const userCode = searchParams.get('user_code')

  return (
    <div className="space-y-4 bg-default">
      <h3 className="mb-2 text-center text-sans-2xl">Client verification</h3>
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
