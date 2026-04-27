/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Dialog as BaseDialog } from '@base-ui/react/dialog'
import * as m from 'motion/react-m'
import { type Ref } from 'react'

import { useIsInModal, useIsInSideModal } from './modal-context'

type Props = { ref?: Ref<HTMLDivElement> }

// Dialog.Backdrop registers itself with base-ui so clicks on it dismiss the
// dialog when modal={true}. A plain <div> here would not.
export const DialogOverlay = ({ ref }: Props) => {
  const isInModal = useIsInModal()
  const isInSideModal = useIsInSideModal()
  // Modal scrim sits above the SideModal popup so Modal-over-SideModal is
  // fully covered; SideModal scrim sits below its own popup. Modal wins when
  // both contexts are set (Modal nested inside SideModal), mirroring
  // usePopoverZIndex's precedence.
  const zClass =
    isInSideModal && !isInModal ? 'z-(--z-side-modal-overlay)' : 'z-(--z-modal-overlay)'
  return (
    // forceRender so the Modal scrim still renders when nested inside a
    // SideModal — otherwise base-ui hides it and the SideModal stays interactive.
    <BaseDialog.Backdrop
      forceRender
      render={
        <m.div
          ref={ref}
          className={`bg-scrim fixed inset-0 overflow-auto ${zClass}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15, ease: 'easeOut' }}
        />
      }
    />
  )
}
