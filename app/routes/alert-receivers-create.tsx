/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { makeCrumb } from '~/hooks/use-crumbs'
import { pb } from '~/util/path-builder'

// the create form is a whole page, not a modal over the list, so it sits
// outside the tabs layout. crumb links back to the list
export const handle = makeCrumb('Receivers', pb.alertReceivers())
export { Outlet as default } from 'react-router'
