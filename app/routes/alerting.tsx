/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { makeCrumb } from '~/hooks/use-crumbs'
import { pb } from '~/util/path-builder'

// /system/alerting redirects to the receivers tab, so point the crumb straight
// at the tab to avoid a flash
export const handle = makeCrumb('Alerting', pb.alertReceivers())
export { Outlet as default } from 'react-router'
