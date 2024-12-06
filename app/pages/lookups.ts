/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { redirect, type LoaderFunctionArgs } from 'react-router-dom'

import { apiq, queryClient } from '@oxide/api'

import { trigger404 } from '~/components/ErrorBoundary'
import { pb } from '~/util/path-builder'

export async function instanceLookupLoader({ params }: LoaderFunctionArgs) {
  try {
    const instance = await queryClient.fetchQuery(
      apiq('instanceView', { path: { instance: params.instance! } })
    )
    const project = await queryClient.fetchQuery(
      apiq('projectView', { path: { project: instance.projectId } })
    )
    return redirect(pb.instance({ project: project.name, instance: instance.name }))
  } catch (_e) {
    throw trigger404
  }
}
