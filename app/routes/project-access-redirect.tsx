/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { redirect } from 'react-router'

import { getProjectSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/project-access-redirect'

// /access has no content of its own; land on the Users tab
export function clientLoader({ params }: Route.ClientLoaderArgs) {
  return redirect(pb.projectUsers(getProjectSelector(params)))
}

export default function ProjectAccessRedirect() {
  return null
}
