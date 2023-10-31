/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useRef, type ReactNode } from 'react'
import { useDialog, type AriaDialogProps } from 'react-aria'

interface DialogProps extends AriaDialogProps {
  children: ReactNode
}

export function Dialog({ children, ...props }: DialogProps) {
  const ref = useRef<HTMLDivElement>(null)
  const { dialogProps } = useDialog(props, ref)

  return (
    <div {...dialogProps} ref={ref}>
      {children}
    </div>
  )
}
