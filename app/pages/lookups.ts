/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { redirect, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient } from '@oxide/api'

import { trigger404 } from 'app/components/ErrorBoundary'
import { pb } from 'app/util/path-builder'

export async function instanceLookupLoader({ params }: LoaderFunctionArgs) {
  try {
    const instance = await apiQueryClient.fetchQuery('instanceView', {
      path: { instance: params.instance! },
    })
    const project = await apiQueryClient.fetchQuery('projectView', {
      path: { project: instance.projectId },
    })
    return redirect(pb.instance({ project: project.name, instance: instance.name }))
  } catch (_e) {
    throw trigger404
  }
}
