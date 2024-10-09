/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import {
  apiQueryClient,
  INSTANCE_MAX_CPU,
  INSTANCE_MAX_RAM_GiB,
  instanceCan,
  useApiMutation,
  useApiQueryClient,
  usePrefetchedApiQuery,
} from '@oxide/api'

import { NumberField } from '~/components/form/fields/NumberField'
import { getInstanceSelector, useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Message } from '~/ui/lib/Message'
import { Modal } from '~/ui/lib/Modal'
import { pb } from '~/util/path-builder'
import { GiB } from '~/util/units'

InstanceResizeForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { project, instance } = getInstanceSelector(params)
  await apiQueryClient.prefetchQuery('instanceView', {
    path: { instance },
    query: { project },
  })
  return null
}

export function InstanceResizeForm() {
  const { instance: instanceName, project } = useInstanceSelector()
  const queryClient = useApiQueryClient()
  const navigate = useNavigate()

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceName },
    query: { project },
  })

  const onDismiss = () => navigate(pb.instance({ project, instance: instanceName }))

  const instanceUpdate = useApiMutation('instanceUpdate', {
    onSuccess(_updatedInstance) {
      queryClient.invalidateQueries('instanceView')
      navigate(pb.instance({ project, instance: instanceName }))
      addToast({ title: 'Instance resized' })
    },
    onError: (err) => {
      addToast({ title: 'Error', content: err.message, variant: 'error' })
    },
    onSettled: onDismiss,
  })

  const form = useForm({
    defaultValues: {
      ncpus: instance.ncpus,
      memory: instance.memory / GiB, // memory is stored as bytes
    },
    mode: 'onChange',
  })

  const canResize = instanceCan.update(instance)
  const isDisabled = !form.formState.isValid || !canResize

  const onAction = form.handleSubmit(({ ncpus, memory }) => {
    instanceUpdate.mutate({
      path: { instance: instanceName },
      query: { project },
      body: { ncpus, memory: memory * GiB, bootDisk: instance.bootDiskId },
    })
  })

  return (
    <Modal
      title="Resize instance"
      isOpen
      onDismiss={() => navigate(pb.instance({ project, instance: instanceName }))}
    >
      <Modal.Body>
        <Modal.Section>
          {!canResize ? (
            <Message variant="error" content="An instance must be stopped to be resized" />
          ) : (
            <Message
              variant="info"
              content={
                <>
                  <span className="text-sans-semi-md text-info">Currently using:</span>{' '}
                  {instance.ncpus} vCPUs / {instance.memory / GiB} GiB
                </>
              }
            />
          )}
          <form autoComplete="off" className="space-y-4">
            <NumberField
              required
              label="CPUs"
              name="ncpus"
              min={1}
              control={form.control}
              validate={(cpus) => {
                if (cpus < 1) {
                  return `Must be at least 1 vCPU`
                }
                if (cpus > INSTANCE_MAX_CPU) {
                  return `CPUs capped to ${INSTANCE_MAX_CPU}`
                }
                // We can show this error and therefore inform the user
                // of the limit rather than preventing it completely
              }}
              disabled={!canResize}
            />
            <NumberField
              units="GiB"
              required
              label="Memory"
              name="memory"
              min={1}
              control={form.control}
              validate={(memory) => {
                if (memory < 1) {
                  return `Must be at least 1 GiB`
                }
                if (memory > INSTANCE_MAX_RAM_GiB) {
                  return `Can be at most ${INSTANCE_MAX_RAM_GiB} GiB`
                }
              }}
              disabled={!canResize}
            />
          </form>
          {instanceUpdate.error && (
            <p className="mt-4 text-error">{instanceUpdate.error.message}</p>
          )}
        </Modal.Section>
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={onAction}
        actionText="Resize"
        actionLoading={instanceUpdate.isPending}
        disabled={isDisabled}
      />
    </Modal>
  )
}
