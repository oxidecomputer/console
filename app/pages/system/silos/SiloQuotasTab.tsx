/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useState } from 'react'
import { type LoaderFunctionArgs } from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '~/api'
import { QuotaTiles } from '~/components/QuotaTile'
import { EditQuotasSideModalForm } from '~/forms/silo-quotas-edit'
import { makeCrumb } from '~/hooks/use-crumbs'
import { getSiloSelector, useSiloSelector } from '~/hooks/use-params'
import { Button } from '~/ui/lib/Button'
import { CardBlock, LearnMore } from '~/ui/lib/CardBlock'
import { docLinks } from '~/util/links'
import type * as PP from '~/util/path-params'

const siloUtil = ({ silo }: PP.Silo) => q(api.siloUtilizationView, { path: { silo } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const { silo } = getSiloSelector(params)
  await queryClient.prefetchQuery(siloUtil({ silo }))
  return null
}

export default function SiloQuotasTab() {
  const { silo } = useSiloSelector()
  const { data: utilization } = usePrefetchedQuery(siloUtil({ silo }))

  const { allocated: quotas, provisioned } = utilization

  const [editing, setEditing] = useState(false)

  return (
    <>
      <CardBlock>
        <CardBlock.Header
          title="Quotas"
          description="Set the CPU, memory, and storage in this silo that users can provision"
        />
        <CardBlock.Body>
          <QuotaTiles provisioned={provisioned} allocated={quotas} storageUnit="GiB" />
        </CardBlock.Body>
        <CardBlock.Footer>
          <LearnMore doc={docLinks.resourceManagement} />
          <Button size="sm" onClick={() => setEditing(true)}>
            Edit quotas
          </Button>
        </CardBlock.Footer>
      </CardBlock>
      {editing && (
        <EditQuotasSideModalForm
          silo={silo}
          quotas={quotas}
          provisioned={provisioned}
          onDismiss={() => setEditing(false)}
        />
      )}
    </>
  )
}

export const handle = makeCrumb('Quotas')
