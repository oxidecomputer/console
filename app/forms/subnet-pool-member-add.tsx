/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type IpVersion,
} from '@oxide/api'

import { NumberField } from '~/components/form/fields/NumberField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useSubnetPoolSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { parseIpNet } from '~/util/ip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

type MemberAddForm = {
  subnet: string
  minPrefixLength: number
  maxPrefixLength: number
}

const defaultValues: MemberAddForm = {
  subnet: '',
  minPrefixLength: NaN,
  maxPrefixLength: NaN,
}

type ValidationErrors = Partial<Record<keyof MemberAddForm, string>>

export function validateMember(poolVersion: IpVersion, values: MemberAddForm) {
  const maxBound = poolVersion === 'v4' ? 32 : 128
  const parsed = parseIpNet(values.subnet)
  const { minPrefixLength: minPL, maxPrefixLength: maxPL } = values
  const subnetWidth = parsed.type !== 'error' ? parsed.width : undefined
  const inRange = (v: number) => !Number.isNaN(v) && v >= 0 && v <= maxBound

  const errors: ValidationErrors = {}

  if (parsed.type === 'error') {
    errors.subnet = parsed.message
  } else if (parsed.type !== poolVersion) {
    errors.subnet = `IP${parsed.type} subnet not allowed in IP${poolVersion} pool`
  }

  // min and max prefix length are optional, and NaN is the value they have
  // when they're unset (matching NumberField)

  // min prefix: bounds → ordering → subnet width
  if (!Number.isNaN(minPL) && !inRange(minPL)) {
    errors.minPrefixLength = `Must be between 0 and ${maxBound}`
  } else if (inRange(minPL) && inRange(maxPL) && minPL > maxPL) {
    errors.minPrefixLength = 'Min prefix length must be ≤ max prefix length'
  } else if (inRange(minPL) && subnetWidth !== undefined && minPL < subnetWidth) {
    errors.minPrefixLength = `Must be ≥ subnet prefix length (${subnetWidth})`
  }

  // max prefix: bounds → subnet width
  if (!Number.isNaN(maxPL) && !inRange(maxPL)) {
    errors.maxPrefixLength = `Must be between 0 and ${maxBound}`
  } else if (inRange(maxPL) && subnetWidth !== undefined && maxPL < subnetWidth) {
    errors.maxPrefixLength = `Must be ≥ subnet prefix length (${subnetWidth})`
  }

  return errors
}

export const handle = titleCrumb('Add Member')

export default function SubnetPoolMemberAdd() {
  const { subnetPool } = useSubnetPoolSelector()
  const navigate = useNavigate()

  const { data: poolData } = usePrefetchedQuery(
    q(api.systemSubnetPoolView, { path: { pool: subnetPool } })
  )

  const onDismiss = () => navigate(pb.subnetPool({ subnetPool }))

  const addMember = useApiMutation(api.systemSubnetPoolMemberAdd, {
    onSuccess() {
      queryClient.invalidateEndpoint('systemSubnetPoolMemberList')
      queryClient.invalidateEndpoint('systemSubnetPoolUtilizationView')
      addToast({ content: 'Member added' })
      onDismiss()
    },
  })

  const form = useForm<MemberAddForm>({ defaultValues })

  const maxBound = poolData.ipVersion === 'v4' ? 32 : 128

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="member"
      title="Add member"
      onDismiss={onDismiss}
      onSubmit={({ subnet, minPrefixLength, maxPrefixLength }) => {
        addMember.mutate({
          path: { pool: subnetPool },
          body: {
            subnet,
            minPrefixLength: Number.isNaN(minPrefixLength) ? undefined : minPrefixLength,
            maxPrefixLength: Number.isNaN(maxPrefixLength) ? undefined : maxPrefixLength,
          },
        })
      }}
      loading={addMember.isPending}
      submitError={addMember.error}
    >
      <Message
        variant="info"
        content={`This pool uses IP${poolData.ipVersion} addresses. Prefix lengths must be between 0 and ${maxBound}.`}
      />
      <TextField
        name="subnet"
        label="Subnet"
        description="CIDR notation (e.g., 10.0.0.0/16)"
        control={form.control}
        required
        validate={(_subnet, values) => validateMember(poolData.ipVersion, values).subnet}
        deps={['minPrefixLength', 'maxPrefixLength']}
      />
      <NumberField
        name="minPrefixLength"
        label="Min prefix length"
        description={`Minimum prefix length for allocations (0–${maxBound})`}
        control={form.control}
        min={0}
        max={maxBound}
        validate={(_minPrefixLength, values) =>
          validateMember(poolData.ipVersion, values).minPrefixLength
        }
      />
      <NumberField
        name="maxPrefixLength"
        label="Max prefix length"
        description={`Maximum prefix length for allocations (0–${maxBound})`}
        control={form.control}
        min={0}
        max={maxBound}
        validate={(_maxPrefixLength, values) =>
          validateMember(poolData.ipVersion, values).maxPrefixLength
        }
        deps="minPrefixLength"
      />
      <SideModalFormDocs docs={[docLinks.subnetPools]} />
    </SideModalForm>
  )
}
