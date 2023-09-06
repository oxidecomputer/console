/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const zIndex = {
  toast: 'z-50',
  modalDropdown: 'z-50',
  modal: 'z-40',
  sideModalDropdown: 'z-40',
  sideModal: 'z-30',
  topBar: 'z-20',
  popover: 'z-10',
  contentDropdown: 'z-10',
  content: 'z-0',
} as const

export const getDropdownZIndex = (isInModal: boolean, isInSideModal: boolean) => {
  if (isInModal) {
    return zIndex.modalDropdown
  }
  if (isInSideModal) {
    return zIndex.sideModalDropdown
  }
  return zIndex.contentDropdown
}
