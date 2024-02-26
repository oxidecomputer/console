/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useNavigate } from 'react-router-dom'

import { useApiMutation, useApiQueryClient, type IpRange } from '@oxide/api'
import { Message } from '@oxide/ui'
import { validateIp } from '@oxide/util'

import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { useForm, useIpPoolSelector } from 'app/hooks'
import { addToast } from 'app/stores/toast'
import { pb } from 'app/util/path-builder'

const defaultValues: IpRange = {
  first: '',
  last: '',
}

const invalidAddressError = { type: 'pattern', message: 'Not a valid IP address' }

const diffVersionError = {
  type: 'custom',
  message: 'First and last must be the same version',
}

/**
 * Pretty straightforward -- make sure IPs are valid and both first and last
 * are the same version. Because we're putting the same version error on both
 * fields, this could also work as a regular validate() on each field, where
 * each field compares itself to the other. It seems silly to run the giant
 * regex twice, though.
 */
function resolver(values: IpRange) {
  const first = validateIp(values.first)
  const last = validateIp(values.last)

  let errors = undefined

  if (!first.valid || !last.valid) {
    errors = {
      first: first.valid ? undefined : invalidAddressError,
      last: last.valid ? undefined : invalidAddressError,
    }
  } else if ((first.isv4 && last.isv6) || (first.isv6 && last.isv4)) {
    errors = { first: diffVersionError, last: diffVersionError }
  }

  // TODO: if we were really cool we could check first <= last but that sounds
  // like a pain

  return errors ? { values: {}, errors } : { values, errors: {} }
}

export function IpPoolAddRangeSideModalForm() {
  const { pool } = useIpPoolSelector()
  const navigate = useNavigate()
  const queryClient = useApiQueryClient()

  const onDismiss = () => navigate(pb.ipPool({ pool }))

  const addRange = useApiMutation('ipPoolRangeAdd', {
    onSuccess(_range) {
      // refetch list of projects in sidebar
      queryClient.invalidateQueries('ipPoolRangeList')
      addToast({ content: 'IP range added' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues, resolver })

  return (
    <SideModalForm
      id="add-ip-range-form"
      form={form}
      title="Add IP range"
      onDismiss={onDismiss}
      onSubmit={(body) => addRange.mutate({ path: { pool }, body })}
      loading={addRange.isPending}
      submitError={addRange.error}
    >
      <Message
        variant="info"
        content="IP ranges are inclusive. Addresses can be either IPv4 or IPv6, but first and last must be the same version, and first must be less than or equal to last."
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
