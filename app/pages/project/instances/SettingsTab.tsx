/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type LoaderFunctionArgs } from 'react-router'

import { queryClient } from '@oxide/api'

import { getInstanceSelector } from '~/hooks/use-params'

import { AntiAffinityCard, antiAffinityGroupList } from './AntiAffinityCard'
import { AutoRestartCard } from './AutoRestartCard'

export const handle = { crumb: 'Settings' }

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const instanceSelector = getInstanceSelector(params)
  await queryClient.prefetchQuery(antiAffinityGroupList(instanceSelector).optionsFn())
  return null
}

export default function SettingsTab() {
  return (
    <div className="space-y-6">
      <AntiAffinityCard />
      <AutoRestartCard />
    </div>
  )
}
