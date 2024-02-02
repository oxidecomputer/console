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

import { SideModalForm, TextField } from 'app/components/form'
import { useForm, useIpPoolSelector } from 'app/hooks'
import { addToast } from 'app/stores/toast'
import { pb } from 'app/util/path-builder'

const defaultValues: IpRange = {
  first: '',
  last: '',
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

  const form = useForm({ defaultValues })

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
        content="IP ranges are inclusive. Addresses can be either IPv4 or IPv6, but both first and last must be the same type, and first must be less than or equal to last."
      />
      {/* TODO: validate these as IP addresses */}
      {/* TODO: validate that they're either both v4 or both v6 */}
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
