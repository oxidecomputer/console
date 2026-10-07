/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'

import { api, queryClient, useApiMutation, type VirtualResourceCounts } from '@oxide/api'
import { Cloud16Icon } from '@oxide/design-system/icons/react'

import { NumberField } from '~/components/form/fields/NumberField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { addToast } from '~/stores/toast'
import { BigNum } from '~/ui/lib/BigNum'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { docLinks } from '~/util/links'
import { bytesToGiB, GiB } from '~/util/units'

type Props = {
  /** Silo name, used as the path param on update */
  silo: string
  /** Current quotas, i.e., the `allocated` counts from silo utilization */
  quotas: VirtualResourceCounts
  /** Currently provisioned amounts, shown under each input for context */
  provisioned: VirtualResourceCounts
  onDismiss: () => void
}

// memory and storage are in GiB here and converted to bytes on submit
type QuotasFormValues = {
  cpus: number
  memory: number
  storage: number
}

const ProvisionedHint = ({ value, unit }: { value: number; unit: string }) => (
  <div className="text-sans-sm text-secondary mt-1">
    Provisioned: <BigNum num={value} /> {unit}
  </div>
)

export function EditQuotasSideModalForm({ silo, quotas, provisioned, onDismiss }: Props) {
  const defaultValues: QuotasFormValues = {
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
            // fractional GiB can produce a fractional byte count, which the API rejects.
            // Ceil rather than round so the quota is never less than what was asked for
            memory: Math.ceil(memory * GiB),
            // TODO: we use GiB on instance create but TiB on utilization. HM
            storage: Math.ceil(storage * GiB),
          },
          path: { silo },
        })
      }
      loading={updateQuotas.isPending || updateQuotas.isSuccess}
      submitError={updateQuotas.error}
    >
      <Message
        content="If a quota is set below the amount currently provisioned, users will not be able to provision new resources."
        variant="info"
      />

      <div>
        <NumberField
          name="cpus"
          label="CPU"
          units="vCPUs"
          required
          control={form.control}
        />
        <ProvisionedHint value={provisioned.cpus} unit="vCPUs" />
      </div>
      <div>
        <NumberField
          name="memory"
          allowDecimals
          label="Memory"
          units="GiB"
          required
          control={form.control}
        />
        <ProvisionedHint value={bytesToGiB(provisioned.memory)} unit="GiB" />
      </div>
      <div>
        <NumberField
          name="storage"
          allowDecimals
          label="Storage"
          units="GiB"
          required
          control={form.control}
        />
        <ProvisionedHint value={bytesToGiB(provisioned.storage)} unit="GiB" />
      </div>
      <SideModalFormDocs docs={[docLinks.resourceManagement]} />
    </SideModalForm>
  )
}
