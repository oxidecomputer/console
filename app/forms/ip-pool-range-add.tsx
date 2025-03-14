/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm, type FieldErrors } from 'react-hook-form'
import { useNavigate } from 'react-router'

import { useApiMutation, useApiQueryClient, type IpRange } from '@oxide/api'

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

const ipv6Error = { type: 'pattern', message: 'IPv6 ranges are not yet supported' }

/**
 * Pretty straightforward -- make sure IPs are valid and both first and last
 * are the same version. Because we're putting the same version error on both
 * fields, this could also work as a regular validate() on each field, where
 * each field compares itself to the other. It seems silly to run the giant
 * regex twice, though.
 */
function resolver(values: IpRange) {
  const first = parseIp(values.first)
  const last = parseIp(values.last)

  const errors: FieldErrors<IpRange> = {}

  if (first.type === 'error') {
    errors.first = { type: 'pattern', message: first.message }
  } else if (first.type === 'v6') {
    errors.first = ipv6Error
  }

  if (last.type === 'error') {
    errors.last = { type: 'pattern', message: last.message }
  } else if (last.type === 'v6') {
    errors.last = ipv6Error
  }

  // TODO: once we support IPv6 we need to check for version mismatch here

  // TODO: if we were really cool we could check first <= last but it would add
  // 6k gzipped to the bundle with ip-num

  // no errors
  return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} }
}

export const handle = titleCrumb('Add Range')

export default function IpPoolAddRange() {
  const { pool } = useIpPoolSelector()
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.ipPool({ pool }))

  const addRange = useApiMutation('ipPoolRangeAdd', {
    onSuccess(_range) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('ipPoolRangeList')
      queryClient.invalidateQueries('ipPoolUtilizationView')
      addToast({ content: 'IP range added' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues, resolver })

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
        content="Only IPv4 ranges are currently supported. Ranges are inclusive, and first must be less than or equal to last."
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
