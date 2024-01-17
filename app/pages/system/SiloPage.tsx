/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link, Outlet, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { DateCell, DefaultCell, linkCell, TruncateCell, useQueryTable } from '@oxide/table'
import {
  Badge,
  buttonStyle,
  Cloud16Icon,
  Cloud24Icon,
  Divider,
  EmptyMessage,
  NextArrow12Icon,
  PageHeader,
  PageTitle,
  Question12Icon,
  TableActions,
  Tooltip,
} from '@oxide/ui'

import { getSiloSelector, useSiloSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { EmptyCellContent } from '../project/instances/instance/tabs/NetworkingTab'

const EmptyState = () => (
  <EmptyMessage icon={<Cloud16Icon />} title="No identity providers" />
)

const RoleMappingTooltip = () => (
  <Tooltip content="Silo roles can automatically grant a fleet role" placement="top">
    <button className="ml-2 flex svg:pointer-events-none">
      <Question12Icon className="text-quinary" />
    </button>
  </Tooltip>
)

SiloPage.loader = async ({ params }: LoaderFunctionArgs) => {
  const { silo } = getSiloSelector(params)
  await Promise.all([
    apiQueryClient.prefetchQuery('siloView', { path: { silo } }),
    apiQueryClient.prefetchQuery('siloIdentityProviderList', {
      query: { silo, limit: 10 }, // same as query table
    }),
  ])
  return null
}

export function SiloPage() {
  const siloSelector = useSiloSelector()

  const { data: silo } = usePrefetchedApiQuery('siloView', { path: siloSelector })

  const roleMapPairs = Object.entries(silo.mappedFleetRoles).flatMap(
    ([fleetRole, siloRoles]) =>
      siloRoles.map((siloRole) => [siloRole, fleetRole] as [string, string])
  )

  const { Table, Column } = useQueryTable('siloIdentityProviderList', {
    query: siloSelector,
  })

  return (
    <>
      <PageHeader>
        <PageTitle icon={<Cloud24Icon />}>{silo.name}</PageTitle>
      </PageHeader>
      <h2 className="mb-6 flex items-center text-mono-sm text-secondary">
        Fleet role mapping <RoleMappingTooltip />
      </h2>
      {roleMapPairs.length === 0 ? (
        <EmptyCellContent />
      ) : (
        <ul className="space-y-3">
          {roleMapPairs.map(([siloRole, fleetRole]) => (
            <li key={siloRole + '|' + fleetRole} className="flex items-center">
              <Badge>Silo {siloRole}</Badge>
              <NextArrow12Icon className="mx-3 text-secondary" aria-label="maps to" />
              <span className="text-sans-md text-secondary">Fleet {fleetRole}</span>
            </li>
          ))}
        </ul>
      )}
      <Divider className="mt-10" />
      <h2 className="mb-4 mt-12 text-mono-sm text-secondary">Identity providers</h2>
      <TableActions>
        <Link to={pb.siloIdpNew(siloSelector)} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </TableActions>
      <Table emptyState={<EmptyState />}>
        {/* TODO: this link will only really work for saml IdPs. */}
        <Column
          id="name"
          accessor={({ name, providerType }) => ({ name, providerType })}
          cell={({ value: { name, providerType } }) =>
            // Only SAML IdPs have a detail view API endpoint, so only SAML IdPs
            // get a link to the detail view. This is a little awkward to do with
            // linkCell as currently designed — probably worth a small rework
            providerType === 'saml' ? (
              linkCell((provider) => pb.samlIdp({ ...siloSelector, provider }))({
                value: name,
              })
            ) : (
              <DefaultCell value={name} />
            )
          }
        />
        <Column
          accessor="description"
          cell={(props) => <TruncateCell {...props} maxLength={48} />}
        />
        <Column
          accessor="providerType"
          header="Type"
          cell={({ value }) => <Badge color="neutral">{value}</Badge>}
        />
        <Column accessor="timeCreated" id="Created" cell={DateCell} />
      </Table>
      <Outlet />
    </>
  )
}
