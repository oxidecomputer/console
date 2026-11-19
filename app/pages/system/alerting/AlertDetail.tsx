/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useNavigate } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'

import { AlertDetailModal } from '~/components/AlertDetailModal'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useAlertSelector } from '~/hooks/use-params'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

import type { Route } from './+types/AlertDetail'

const alertView = ({ alertId }: PP.Alert) => q(api.alertView, { path: { alertId } })

export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const { alertId } = params
  await queryClient.prefetchQuery(alertView({ alertId }))
  return null
}

export const handle = titleCrumb('Alert')

export default function AlertDetail() {
  const navigate = useNavigate()
  const selector = useAlertSelector()
  const { data: alert } = usePrefetchedQuery(alertView(selector))
  return <AlertDetailModal alert={alert} onDismiss={() => navigate(pb.alerts())} />
}
