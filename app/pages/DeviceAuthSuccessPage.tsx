/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Success12Icon } from '@oxide/design-system/icons/react'

/**
 * Device authorization success page
 */
export default function DeviceAuthSuccessPage() {
  return (
    <div className="bg-raise! border-secondary elevation-3 flex w-full max-w-[470px] flex-col items-center rounded-lg border p-9 text-center">
      <div className="my-2 flex h-12 w-12 items-center justify-center">
        <div className="bg-accent absolute h-12 w-12 rounded-full opacity-20 motion-safe:animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]" />
        <Success12Icon className="text-accent relative h-8 w-8" />
      </div>
      <h1 className="text-sans-2xl text-accent mt-4">Device logged in</h1>
      <p className="text-sans-lg text-secondary mt-1">You can close this window</p>
    </div>
  )
}
