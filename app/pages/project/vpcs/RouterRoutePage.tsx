/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { IpGlobal24Icon } from '@oxide/design-system/icons/react'

import {
  getRouterRouteSelector,
  getVpcRouterSelector,
  useRouterRouteSelector,
} from '~/hooks'
import { PAGE_SIZE } from '~/table/QueryTable'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'

RouterRoutePage.loader = async function ({ params }: LoaderFunctionArgs) {
  const { project, vpc, router } = getVpcRouterSelector(params)
  const { route } = getRouterRouteSelector(params)
  const query = { limit: PAGE_SIZE }
  await apiQueryClient.prefetchQuery('vpcRouterRouteView', {
    path: { route },
    query: { project, vpc, router, ...query },
  })
  return null
}

export function RouterRoutePage() {
  const query = { limit: PAGE_SIZE }
  const { project, vpc, router, route } = useRouterRouteSelector()
  const { data: routes } = usePrefetchedApiQuery('vpcRouterRouteView', {
    path: { route },
    query: { project, vpc, router, ...query },
  })
  console.log({ routes })
  return (
    <>
      <PageHeader>
        <PageTitle icon={<IpGlobal24Icon />}>{routes.name}</PageTitle>
      </PageHeader>
    </>
  )
}
