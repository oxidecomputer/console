/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import type { SetNonNullable } from 'type-fest'

import {
  api,
  queryClient,
  useApiMutation,
  type SiloQuotasUpdate,
  type VirtualResourceCounts,
} from '@oxide/api'
import { Cloud16Icon } from '@oxide/design-system/icons/react'

import { NumberField } from '~/components/form/fields/NumberField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { links } from '~/util/links'
import { bytesToGiB, GiB } from '~/util/units'

type Props = {
  /** Silo name, used as the path param on update */
  silo: string
  /** Current quotas, i.e., the `allocated` counts from silo utilization */
  quotas: VirtualResourceCounts
  onDismiss: () => void
}

export function EditQuotasSideModalForm({ silo, quotas, onDismiss }: Props) {
  // required because we need to rule out undefined because NumberField hates that
  const defaultValues: SetNonNullable<Required<SiloQuotasUpdate>> = {
    cpus: quotas.cpus,
    memory: bytesToGiB(quotas.memory),
    storage: bytesToGiB(quotas.storage),
  }

  const form = useForm({ defaultValues })

  const updateQuotas = useApiMutation(api.siloQuotasUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('siloUtilizationView')
      queryClient.invalidateEndpoint('siloUtilizationList')
      addToast({ content: 'Quotas updated' })
      onDismiss()
    },
  })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="Quotas"
      title="Edit quotas"
      subtitle={
        <ResourceLabel>
          <Cloud16Icon /> {silo}
        </ResourceLabel>
      }
      onDismiss={onDismiss}
      onSubmit={({ cpus, memory, storage }) =>
        updateQuotas.mutate({
          body: {
            cpus,
            memory: memory * GiB,
            // TODO: we use GiB on instance create but TiB on utilization. HM
            storage: storage * GiB,
          },
          path: { silo },
        })
      }
      loading={updateQuotas.isPending}
      submitError={updateQuotas.error}
    >
      <Message content={<LearnMore />} variant="info" />

      <NumberField name="cpus" label="CPU" units="vCPUs" required control={form.control} />
      <NumberField
        name="memory"
        label="Memory"
        units="GiB"
        required
        control={form.control}
      />
      <NumberField
        name="storage"
        label="Storage"
        units="GiB"
        required
        control={form.control}
      />
    </SideModalForm>
  )
}

function LearnMore() {
  return (
    <>
      If a quota is set below the amount currently in use, users will not be able to
      provision resources. Learn more about quotas in the{' '}
      <a
        href={links.siloQuotasDocs}
        // don't need color and hover color because message text is already color-info anyway
        className="underline"
        target="_blank"
        rel="noreferrer"
      >
        Silos
      </a>{' '}
      guide.
    </>
  )
}
