import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { useApiMutation } from '@oxide/api'
import { AuthCodeInput, Button, Warning12Icon } from '@oxide/ui'

import { pb } from 'app/util/path-builder'

/**
 * Device authorization verification page
 */
export default function DeviceAuthVerifyPage() {
  const navigate = useNavigate()
  const confirmPost = useApiMutation('deviceAuthConfirm', {
    onSuccess: () => {
      navigate(pb.deviceSuccess())
    },
  })

  const [userCode, setUserCode] = useState('')

  return (
    <form
      className="w-full max-w-[470px] rounded-lg border p-9 text-center !bg-raise border-secondary elevation-3"
      onSubmit={(event) => {
        event.preventDefault()

        // we know `userCode` is non-null because the button is disabled
        // otherwise, but let's make TS happy
        if (userCode) {
          // nexus wants the dash. we plan on changing that so it doesn't care
          const code = userCode.slice(0, 4) + '-' + userCode.slice(4)
          confirmPost.mutate({ body: { userCode: code } })
        }
      }}
    >
      <h1 className="mb-1 text-sans-2xl text-accent">Device Authentication</h1>
      <p className="mb-8 text-sans-lg text-tertiary">
        Make sure this code matches the one shown on the device you are authenticating
      </p>
      <AuthCodeInput
        onChange={(code) => setUserCode(code)}
        containerClassName="flex space-x-2 mb-6"
        inputClassName="rounded border border-default bg-default w-full aspect-square flex items-center justify-center text-center text-secondary uppercase text-mono-md"
        length={8}
        dashAfterIdxs={[3]}
      />
      <Button
        className="w-full !text-mono-sm"
        type="submit"
        loading={confirmPost.isLoading}
        disabled={confirmPost.isLoading || confirmPost.isSuccess || userCode.length < 8}
      >
        Log in on device
      </Button>
      {confirmPost.isError && (
        <div className="mt-3 flex items-center justify-center text-sans-md text-error">
          <Warning12Icon /> <div className="ml-1">Code is invalid</div>
        </div>
      )}
    </form>
  )
}
