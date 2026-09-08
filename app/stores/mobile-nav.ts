/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { create } from 'zustand'

/**
 * Whether the sidebar nav is open as an overlay on small screens. Above the
 * mobile breakpoint the sidebar is always visible and this state is ignored.
 */
export const useMobileNavStore = create<{ isOpen: boolean }>(() => ({ isOpen: false }))

export const closeMobileNav = () => useMobileNavStore.setState({ isOpen: false })

export const toggleMobileNav = () =>
  useMobileNavStore.setState(({ isOpen }) => ({ isOpen: !isOpen }))
