/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { create } from 'zustand'

// We need a global variable we can use to pop a session expired modal.
//
// This is a little overwrought maybe, but this is how zustand works so we do it
// this way. It would be a one liner in jotai, but this isn't much more.

export const useSessionExpiredStore = create(() => false)

export function setSessionExpired() {
  useSessionExpiredStore.setState(true)
}

export function clearSessionExpired() {
  useSessionExpiredStore.setState(false)
}
