/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'

import {
  api,
  apiqErrorsAllowed,
  queryClient,
  useApiMutation,
  type FloatingIp,
  type Instance,
} from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { HL } from '~/components/HL'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { Slash } from '~/ui/lib/Slash'

import { ModalForm } from './form/ModalForm'

function IpPoolName({ ipPoolId }: { ipPoolId: string }) {
  const { data: result } = useQuery(
    apiqErrorsAllowed(api.projectIpPoolView, { path: { pool: ipPoolId } })
  )
  // As with IpPoolCell, this should never happen, but to be safe …
  if (!result || result.type === 'error') return null
  return (
    <>
      <Slash />
      <span>{result.data.name}</span>
    </>
  )
}

function FloatingIpLabel({ fip }: { fip: FloatingIp }) {
  return (
    <div className="text-secondary selected:text-accent-secondary">
      <div>{fip.name}</div>
      <div className="flex gap-0.5">
        <div>{fip.ip}</div>
        <IpPoolName ipPoolId={fip.ipPoolId} />
        {fip.description && (
          <>
            <Slash />
            <div className="grow overflow-hidden text-left text-ellipsis whitespace-pre">
              {fip.description}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export const AttachFloatingIpModal = ({
  floatingIps,
  instance,
  onDismiss,
}: {
  floatingIps: Array<FloatingIp>
  instance: Instance
  onDismiss: () => void
}) => {
  const floatingIpAttach = useApiMutation(api.floatingIpAttach, {
    onSuccess(floatingIp) {
      queryClient.invalidateEndpoint('floatingIpList')
      queryClient.invalidateEndpoint('instanceExternalIpList')
      addToast(<>IP <HL>{floatingIp.name}</HL> attached</>) // prettier-ignore
      onDismiss()
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
  })
  const form = useForm({ defaultValues: { floatingIp: '' } })
  const floatingIp = form.watch('floatingIp')

  return (
    <ModalForm
      form={form}
      onDismiss={onDismiss}
      submitLabel="Attach floating IP"
      submitError={floatingIpAttach.error}
      loading={floatingIpAttach.isPending}
      title="Attach floating IP"
      onSubmit={() =>
        floatingIpAttach.mutate({
          path: { floatingIp }, // note that this is an ID!
          body: { kind: 'instance', parent: instance.id },
        })
      }
      submitDisabled={!floatingIp}
    >
      <Message
        variant="info"
        content={`Instance ‘${instance.name}’ will be reachable at the selected IP address`}
      />
      <form>
        <ListboxField
          control={form.control}
          name="floatingIp"
          label="Floating IP"
          placeholder="Select a floating IP"
          items={floatingIps.map((ip) => ({
            value: ip.id,
            label: <FloatingIpLabel fip={ip} />,
            selectedLabel: ip.name,
          }))}
          required
        />
      </form>
    </ModalForm>
  )
}
