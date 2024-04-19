/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { announce } from '@react-aria/live-announcer'
import { animated, useTransition } from '@react-spring/web'
import { useEffect } from 'react'

import { Error12Icon } from '@oxide/design-system/icons/react'

import { loginUrl } from '~/api/nav-to-login'
import { useSessionExpiredStore } from '~/stores/session-expired'
import { buttonStyle } from '~/ui/lib/Button'

import { getStyle, ToastStackContainer, toastTransitionConfig } from './ToastStack'

// TODO: figure out how to prevent this from conflicting with the regular toastStack,
// probably by putting it in the ToastStack

export function SessionExpiredToast() {
  const expired = useSessionExpiredStore() || true

  const transition = useTransition(expired, toastTransitionConfig)

  return (
    <ToastStackContainer>
      {transition((style, item) =>
        item ? (
          <animated.div style={getStyle(style)}>
            <SessionToast />
          </animated.div>
        ) : null
      )}
    </ToastStackContainer>
  )
}

const title = 'Session expired'
const content =
  'Your session has expired. Please sign in again. Any unsubmitted form entries will be discarded.'

// What is a toast yet not a toast? This thing! It is an extremely simplified toast.
export const SessionToast = () => {
  // TODO: consider assertive announce for error toasts
  useEffect(() => announce(title + ' ' + content, 'polite'), [])
  return (
    <div className="relative flex w-[28rem] items-start overflow-hidden rounded-lg p-4 text-sans-md text-error bg-error-300">
      <div className="mt-[2px] flex svg:h-3 svg:w-3">
        <Error12Icon />
      </div>
      <div className="flex-1 pl-2.5">
        <div className="mb-1 text-error">{title}</div>
        <div className="mb-2 text-error-secondary">{content}</div>
        <a
          // className="mt-3 block text-mono-sm text-error-secondary hover:text-error"
          className={buttonStyle({ size: 'sm', variant: 'danger' })}
          href={loginUrl({ includeCurrent: true })}
        >
          Sign in
        </a>
      </div>
    </div>
  )
}
