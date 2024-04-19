/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { animated, useTransition, type SpringValue } from '@react-spring/web'

import { removeToast, useToastStore } from '~/stores/toast'
import { Toast } from '~/ui/lib/Toast'
import { classed } from '~/util/classed'

export const toastTransitionConfig = {
  from: { opacity: 0, y: 10, scale: 95 },
  enter: { opacity: 1, y: 0, scale: 100 },
  leave: { opacity: 0, y: 10, scale: 95 },
  config: { duration: 100 },
}

export const ToastStackContainer = classed.div`pointer-events-auto fixed bottom-4 left-4 z-toast flex flex-col items-end space-y-2`

type SpringValues = {
  opacity: SpringValue<number>
  y: SpringValue<number>
  scale: SpringValue<number>
}

export const getStyle = (style: SpringValues) => ({
  opacity: style.opacity,
  y: style.y,
  transform: style.scale.to((val) => `scale(${val}%, ${val}%)`),
})

export function ToastStack() {
  const toasts = useToastStore((state) => state.toasts)

  const transition = useTransition(toasts, {
    keys: (toast) => toast.id,
    ...toastTransitionConfig,
  })

  return (
    <ToastStackContainer>
      {transition((style, item) => (
        <animated.div style={getStyle(style)}>
          <Toast
            key={item.id}
            {...item.options}
            onClose={() => {
              removeToast(item.id)
              item.options.onClose?.()
            }}
          />
        </animated.div>
      ))}
    </ToastStackContainer>
  )
}
