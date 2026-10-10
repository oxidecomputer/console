/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { makeCrumb } from '~/hooks/use-crumbs'
import { getInstanceSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

export const handle = makeCrumb(
  (p) => getInstanceSelector(p).instance,
  (p) => pb.instance(getInstanceSelector(p))
)
export { Outlet as default } from 'react-router'
