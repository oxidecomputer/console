import { useState } from 'react'
import AuthCode from 'react-auth-code-input'
import { useNavigate } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { Button, Warning12Icon } from '@oxide/ui'

import 'app/components/auth-code.css'
import { pb } from 'app/util/path-builder'

/**
 * Device authorization verification page
 */
export default function DeviceAuthVerifyPage() {
  const [hasError, setHasError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const navigate = useNavigate()
  const confirmPost = useApiMutation('deviceAuthConfirm', {
    onSuccess: () => {
      navigate(pb.deviceSuccess())
    },
    onError: () => {
      setHasError(true)
      setIsLoading(false)
    },
  })

  const [userCode, setUserCode] = useState<string>('')
  const handleOnChange = (res: string) => {
    setUserCode(res)
  }

  const isFilled = userCode.length === 8

  return (
    <form
      className="w-full max-w-[470px] rounded-lg border p-9 text-center !bg-raise border-secondary elevation-3"
      onSubmit={(event) => {
        event.preventDefault()
        // Reset the error when the user tweaks the code
        if (hasError) {
          setHasError(false)
        }

        // we know `userCode` is non-null because the button is disabled
        // otherwise, but let's make TS happy
        if (userCode) {
          setIsLoading(true)
          confirmPost.mutate({ body: { userCode } })
        }
      }}
    >
      <h1 className="mb-1 text-sans-2xl text-accent">Device Authentication</h1>
      <p className="mb-8 text-sans-lg text-tertiary">
        Make sure this code matches the one shown on the device you are authenticating
      </p>
      <AuthCode
        onChange={handleOnChange}
        containerClassName="flex space-x-2 auth-code-wrapper mb-6"
        inputClassName="rounded border border-default bg-default w-full aspect-square flex items-center justify-center text-center text-secondary uppercase text-mono-md"
        length={8}
      />
      <Button
        className="w-full !text-mono-sm"
        type="submit"
        loading={isLoading}
        disabled={confirmPost.isLoading || confirmPost.isSuccess || !isFilled}
      >
        Log in on device
      </Button>
      {hasError && (
        <div className="mt-3 flex items-center justify-center text-sans-md text-error">
          <Warning12Icon /> <div className="ml-1">Code is invalid</div>
        </div>
      )}
    </form>
  )
}
