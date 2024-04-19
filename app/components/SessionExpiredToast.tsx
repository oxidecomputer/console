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
import { Button } from '~/ui/lib/Button'

const title = 'Session expired'
const content =
  'Your session has expired. Please sign in again. Any unsubmitted form entries will be discarded.'

function openLoginAndListen() {
  // don't include current in query string because we don't want a  redirect
  // back here after in that tab. we just want to close that tab

  // TODO: maybe add a query param that tells the successful login to show a
  // "close this tab" view after success instead of landing on /
  const _popup = window.open(loginUrl())

  window.addEventListener(
    'message',
    (event) => {
      // ignore messages from anyone other than ourselves
      if (event.origin !== window.origin) return

      console.log(event)

      // event.source is popup
      // event.data is "hi there yourself!  the secret response is: rheeeeet!"
    },
    false
  )
}

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
        <Button size="sm" variant="danger" onClick={openLoginAndListen}>
          Sign in
        </Button>
      </div>
    </div>
  )
}
