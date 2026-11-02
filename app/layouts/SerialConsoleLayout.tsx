/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { Route } from './+types/SerialConsoleLayout'
import { SerialConsoleContentPane } from './helpers.tsx'
import {
  ProjectLayoutBase,
  projectLayoutHandle,
  projectLayoutLoader,
} from './ProjectLayoutBase.tsx'

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return projectLayoutLoader(params)
}

export const handle = projectLayoutHandle

export default function SerialConsoleLayout() {
  return <ProjectLayoutBase overrideContentPane={<SerialConsoleContentPane />} />
}
