/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { redirect } from 'react-router'

import { pb } from '~/util/path-builder'

export function clientLoader() {
  return redirect(pb.projects())
}

export default function Index() {
  return null
}
