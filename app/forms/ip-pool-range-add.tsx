/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm, type FieldErrors } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  usePrefetchedQuery,
  type IpRange,
  type IpVersion,
} from '@oxide/api'

import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useIpPoolSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { parseIp } from '~/util/ip'
import { pb } from '~/util/path-builder'

const defaultValues: IpRange = {
  first: '',
  last: '',
}

/**
 * Validates IP range addresses against the pool's IP version.
 * Ensures both addresses are valid IPs, match the pool's version,
 * and are the same version as each other.
 */
function createResolver(poolVersion: IpVersion) {
  return (values: IpRange) => {
    const first = parseIp(values.first)
    const last = parseIp(values.last)

    const errors: FieldErrors<IpRange> = {}

    // Validate first address
    if (first.type === 'error') {
      errors.first = { type: 'pattern', message: first.message }
    } else if (first.type === 'v4' && poolVersion === 'v6') {
      errors.first = {
        type: 'pattern',
        message: 'IPv4 address not allowed in IPv6 pool',
      }
    } else if (first.type === 'v6' && poolVersion === 'v4') {
      errors.first = {
        type: 'pattern',
        message: 'IPv6 address not allowed in IPv4 pool',
      }
    }

    // Validate last address
    if (last.type === 'error') {
      errors.last = { type: 'pattern', message: last.message }
    } else if (last.type === 'v4' && poolVersion === 'v6') {
      errors.last = {
        type: 'pattern',
        message: 'IPv4 address not allowed in IPv6 pool',
      }
    } else if (last.type === 'v6' && poolVersion === 'v4') {
      errors.last = {
        type: 'pattern',
        message: 'IPv6 address not allowed in IPv4 pool',
      }
    }

    // Check that both addresses are the same version
    if (first.type !== 'error' && last.type !== 'error' && first.type !== last.type) {
      const versionMismatchError = {
        type: 'pattern',
        message: 'Both addresses must be the same IP version',
      }
      errors.first = versionMismatchError
      errors.last = versionMismatchError
    }

    // TODO: if we were really cool we could check first <= last but it would add
    // 6k gzipped to the bundle with ip-num

    // no errors
    return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} }
  }
}

export const handle = titleCrumb('Add Range')

export default function IpPoolAddRange() {
  const { pool } = useIpPoolSelector()
  const navigate = useNavigate()

  const { data: poolData } = usePrefetchedQuery(q(api.ipPoolView, { path: { pool } }))
  const poolVersion = poolData.ipVersion

  const onDismiss = () => navigate(pb.ipPool({ pool }))

  const addRange = useApiMutation(api.ipPoolRangeAdd, {
    onSuccess(_range) {
      // refetch list of projects in sidebar
      queryClient.invalidateEndpoint('ipPoolRangeList')
      queryClient.invalidateEndpoint('ipPoolUtilizationView')
      addToast({ content: 'IP range added' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues, resolver: createResolver(poolVersion) })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="IP range"
      title="Add IP range"
      onDismiss={onDismiss}
      onSubmit={(body) => addRange.mutate({ path: { pool }, body })}
      loading={addRange.isPending}
      submitError={addRange.error}
    >
      <Message
        variant="info"
        content={`This pool uses IP${poolVersion} addresses. Ranges are inclusive, and first must be less than or equal to last.`}
      />
      <TextField
        name="first"
        description="First address in the range"
        control={form.control}
        required
      />
      <TextField
        name="last"
        description="Last address in the range"
        control={form.control}
        required
      />
    </SideModalForm>
  )
}
