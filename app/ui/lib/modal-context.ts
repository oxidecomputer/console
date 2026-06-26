/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createContext, useContext, type RefObject } from 'react'

export const ModalContext = createContext(false)
export const useIsInModal = () => useContext(ModalContext)

export const SideModalContext = createContext(false)
export const useIsInSideModal = () => useContext(SideModalContext)

// Ref to the SideModal's popup element. Used by ConfirmModal so its Dialog
// can portal into the SideModal instead of the document body — that lets the
// scrim and centered dialog sit inside the SideModal naturally.
export const SideModalPopupRefContext =
  createContext<RefObject<HTMLDivElement | null> | null>(null)
export const useSideModalPopupRef = () => useContext(SideModalPopupRefContext)
