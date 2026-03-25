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
  type IpRange,
  type IpVersion,
} from '@oxide/api'

import { noPasswordManager, TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useIpPoolSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { parseIp } from '~/util/ip'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'

const defaultValues: IpRange = {
  first: '',
  last: '',
}

const validateAddress = (value: string, poolVersion: IpVersion) => {
  const parsed = parseIp(value)
  if (parsed.type === 'error') return parsed.message
  if (parsed.type !== poolVersion) {
    return `IP${parsed.type} address not allowed in IP${poolVersion} pool`
  }
}

export const handle = titleCrumb('Add Range')

export default function IpPoolAddRange() {
  const { pool } = useIpPoolSelector()
  const navigate = useNavigate()

  const { data: poolData } = usePrefetchedQuery(q(api.systemIpPoolView, { path: { pool } }))

  const onDismiss = () => navigate(pb.ipPool({ pool }))

  const addRange = useApiMutation(api.systemIpPoolRangeAdd, {
    onSuccess(_range) {
      queryClient.invalidateEndpoint('systemIpPoolRangeList')
      queryClient.invalidateEndpoint('systemIpPoolUtilizationView')
      addToast({ content: 'IP range added' })
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

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
        content={`This pool uses IP${poolData.ipVersion} addresses. Ranges are inclusive, and first must be less than or equal to last.`}
      />
      <TextField
        name="first"
        description="First address in the range"
        control={form.control}
        required
        validate={(value) => validateAddress(value, poolData.ipVersion)}
        {...noPasswordManager}
      />
      <TextField
        name="last"
        description="Last address in the range"
        control={form.control}
        required
        validate={(value) => validateAddress(value, poolData.ipVersion)}
        {...noPasswordManager}
      />
      <SideModalFormDocs
        docs={[docLinks.systemIpPools]}
        apiOp="system_ip_pool_range_add"
        cliCmd="system/networking/ip-pool/range/add"
      />
    </SideModalForm>
  )
}
