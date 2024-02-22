/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Badge } from 'libs/ui/lib/badge/Badge'
import { buttonStyle } from 'libs/ui/lib/button/Button'
import { Link, Outlet } from 'react-router-dom'

import { DateCell, DefaultCell, linkCell, TruncateCell, useQueryTable } from '@oxide/table'
import { Cloud24Icon, EmptyMessage } from '@oxide/ui'

import { useSiloSelector } from 'app/hooks'
import { pb } from 'app/util/path-builder'

const EmptyState = () => (
  <EmptyMessage icon={<Cloud24Icon />} title="No identity providers" />
)

export function SiloIdpsTab() {
  const siloSelector = useSiloSelector()

  const { Table, Column } = useQueryTable('siloIdentityProviderList', {
    query: siloSelector,
  })

  return (
    <>
      <div className="mb-3 flex justify-end space-x-2">
        <Link to={pb.siloIdpNew(siloSelector)} className={buttonStyle({ size: 'sm' })}>
          New provider
        </Link>
      </div>
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
