/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Networking24Icon, PageHeader, PageTitle, PropertiesTable } from '@oxide/ui'
import { formatDateTime } from '@oxide/util'

import { getFloatingIpSelector, useFloatingIpSelector } from 'app/hooks'

FloatingIpPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, floatingIp } = getFloatingIpSelector(params)
  await Promise.all([
    // fetch all instances so we can map their id to their name
    apiQueryClient.prefetchQuery('instanceList', { query: { project } }),

    // const { data } = usePrefetchedApiQuery('imageView', { path: { image } })

    apiQueryClient.prefetchQuery('floatingIpView', {
      path: { floatingIp },
      query: { project },
    }),
  ])
  return null
}

export function FloatingIpPage() {
  // get the project name from the url
  const { project, floatingIp } = useFloatingIpSelector()
  // set the instances to the data from the instanceList query and console log them
  const { data: instances } = usePrefetchedApiQuery('instanceList', { query: { project } })
  console.log(instances)
  // get the floatingIp data
  // const { data } = usePrefetchedApiQuery('imageView', { path: { image } })
  const { data: fip } = usePrefetchedApiQuery('floatingIpView', {
    path: { floatingIp },
    query: { project },
  })
  console.log(fip)
  return (
    <>
      <PageHeader>
        <PageTitle icon={<Networking24Icon />}>{fip.name}</PageTitle>
      </PageHeader>
      <PropertiesTable.Group className="mb-16">
        <PropertiesTable>
          <PropertiesTable.Row label="Description">{fip.description}</PropertiesTable.Row>
        </PropertiesTable>
        <PropertiesTable>
          <PropertiesTable.Row label="Created">
            {formatDateTime(fip.timeCreated)}
          </PropertiesTable.Row>
          <PropertiesTable.Row label="Last Modified">
            {formatDateTime(fip.timeModified)}
          </PropertiesTable.Row>
        </PropertiesTable>
      </PropertiesTable.Group>
      <p>
        We, uh, don’t actually need a page for this; this was more of a proof-of-concept as
        I figured out routing and data fetching
      </p>
    </>
  )
}
