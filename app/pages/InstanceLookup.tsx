/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { redirect } from 'react-router'

import { api, q, queryClient } from '@oxide/api'

import { trigger404 } from '~/components/ErrorBoundary'
import { pb } from '~/util/path-builder'

import type { Route } from './+types/InstanceLookup'

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  try {
    const instance = await queryClient.fetchQuery(
      q(api.instanceView, { path: { instance: params.instance } })
    )
    const project = await queryClient.fetchQuery(
      q(api.projectView, { path: { project: instance.projectId } })
    )
    return redirect(pb.instance({ project: project.name, instance: instance.name }))
  } catch (_e) {
    throw trigger404
  }
}

/** This should never render because the loader always redirects or 404s */
export default function InstanceLookup() {
  return null
}
