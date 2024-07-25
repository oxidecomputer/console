/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { createContext, useContext } from 'react'

export const ModalContext = createContext(false)
export const useIsInModal = () => useContext(ModalContext)

export const SideModalContext = createContext(false)
export const useIsInSideModal = () => useContext(SideModalContext)
