/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'
import { create } from 'zustand'

type ActionConfig = {
  /** Must be `mutateAsync`, otherwise we can't catch the error generically */
  doAction: () => Promise<unknown>
  /** e.g., Confirm delete, Confirm unlink */
  modalTitle: string
  modalContent: ReactNode
  /** Title of error toast */
  errorTitle: string
  actionType: 'primary' | 'danger'
}

type ConfirmActionStore = {
  actionConfig: ActionConfig | null
}

export const useConfirmAction = create<ConfirmActionStore>(() => ({
  actionConfig: null,
}))

// zustand docs say this pattern is equivalent to putting the actions on the
// store and has no downsides, despite all the readme examples doing it the
// other way. We do it this way so can modify the store in callbacks without
// calling the useStore hook. Only components that need to subscribe to changes
// in the store need to the hook.
// https://github.com/pmndrs/zustand/blob/a5343354/docs/guides/practice-with-no-store-actions.md

export function confirmAction(actionConfig: ActionConfig) {
  useConfirmAction.setState({ actionConfig })
}

export function clearConfirmAction() {
  useConfirmAction.setState({ actionConfig: null })
}
