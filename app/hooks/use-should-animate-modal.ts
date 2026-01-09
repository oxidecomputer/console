/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { NavigationType, useNavigationType } from 'react-router'

/**
 * Only animate the modal in when we're navigating by a client-side click.
 * Don't animate on a fresh pageload or on back/forward. The latter may be
 * slightly awkward but it also makes some sense. I do not believe there is
 * any way to distinguish between fresh pageload and back/forward.
 */
export function useShouldAnimateModal() {
  const navType = useNavigationType()
  return navType === NavigationType.Push || navType === NavigationType.Replace
}
