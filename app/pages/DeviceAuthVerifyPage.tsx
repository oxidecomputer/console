/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useNavigate } from 'react-router'

import { useApiMutation } from '@oxide/api'
import { Warning12Icon } from '@oxide/design-system/icons/react'

import { AuthCodeInput } from '~/ui/lib/AuthCodeInput'
import { Button } from '~/ui/lib/Button'
import { pb } from '~/util/path-builder'
import { addDashes } from '~/util/str'

const DASH_AFTER_IDXS = [3]

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
      className="w-full max-w-[470px] rounded-lg border p-9 text-center bg-raise! border-secondary elevation-3"
      onSubmit={(event) => {
        event.preventDefault()

        // we know `userCode` is non-null because the button is disabled
        // otherwise, but let's make TS happy
        if (userCode) {
          confirmPost.mutate({ body: { userCode: addDashes(DASH_AFTER_IDXS, userCode) } })
        }
      }}
    >
      <h1 className="mb-1 text-sans-2xl text-accent">Device Authentication</h1>
      <p className="mb-8 text-sans-lg text-secondary">
        Enter the code shown on your device
      </p>
      <AuthCodeInput
        onChange={(code) => setUserCode(code)}
        containerClassName="flex space-x-2 mb-6"
        inputClassName="rounded border border-default bg-default w-full aspect-square flex items-center justify-center text-center text-default text-mono-md"
        length={8}
        dashAfterIdxs={DASH_AFTER_IDXS}
      />
      <Button
        className="w-full text-mono-sm!"
        type="submit"
        loading={confirmPost.isPending}
        disabled={confirmPost.isPending || confirmPost.isSuccess || userCode.length < 8}
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
