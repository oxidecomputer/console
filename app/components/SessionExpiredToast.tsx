/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { announce } from '@react-aria/live-announcer'
import { useEffect } from 'react'

import { Error12Icon } from '@oxide/design-system/icons/react'

import { loginUrl } from '~/api/nav-to-login'
import { buttonStyle } from '~/ui/lib/Button'

const title = 'Session expired'
const content =
  'Your session has expired. Please sign in again. Any unsubmitted form entries will be discarded.'

// What is a toast yet not a toast? This thing! It is an extremely simplified toast.
export const SessionToast = () => {
  // TODO: consider assertive announce for error toasts
  useEffect(() => announce(title + ' ' + content, 'polite'), [])
  return (
    <div className="relative flex w-[28rem] items-start overflow-hidden rounded-lg p-4 text-sans-md text-error bg-error-300">
      <div className="mt-[3px] flex svg:h-3 svg:w-3">
        <Error12Icon />
      </div>
      <div className="flex-1 pl-2.5">
        <div className="mb-0.5 text-sans-semi-md text-error">{title}</div>
        <div className="mb-3 text-error-secondary">{content}</div>
        <a
          className={buttonStyle({ size: 'sm', variant: 'danger' })}
          href={loginUrl({ includeCurrent: true })}
        >
          Sign in
        </a>
      </div>
    </div>
  )
}
