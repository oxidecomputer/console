/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useId } from 'react'
import { useForm } from 'react-hook-form'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '~/api'
import {
  ShutdownPolicyField,
  shutdownPolicyEqual,
  shutdownPolicyFromForm,
  shutdownPolicyToForm,
} from '~/components/form/fields/ShutdownPolicyField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { CardBlock, LearnMore } from '~/ui/lib/CardBlock'
import { docLinks } from '~/util/links'

export function ShutdownPolicyCard() {
  const instanceSelector = useInstanceSelector()
  const titleId = useId()

  const { data: instance } = usePrefetchedQuery(
    q(api.instanceView, {
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
    })
  )

  const instanceUpdate = useApiMutation(api.instanceUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('instanceView')
      addToast({ content: 'Instance shutdown policy updated' })
    },
    onError(err) {
      addToast({
        title: 'Could not update shutdown policy',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const form = useForm({
    defaultValues: shutdownPolicyToForm(instance.shutdownPolicy),
    mode: 'onChange',
  })

  // like auto restart, there are no instance state restrictions on updating
  // the shutdown policy, so there is no instanceCan helper for it
  const unchanged = shutdownPolicyEqual(
    shutdownPolicyFromForm(form.watch()),
    instance.shutdownPolicy
  )
  const disableSubmit = unchanged || !form.formState.isValid

  const onSubmit = form.handleSubmit((values) => {
    instanceUpdate.mutate({
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
      body: {
        shutdownPolicy: shutdownPolicyFromForm(values),
        ncpus: instance.ncpus,
        memory: instance.memory,
        cpuPlatform: instance.cpuPlatform || null,
        bootDisk: instance.bootDiskId || null,
        autoRestartPolicy: instance.autoRestartPolicy || null,
        enableJumboFrames: instance.enableJumboFrames,
      },
    })
  })

  return (
    <form onSubmit={onSubmit} aria-labelledby={titleId}>
      <CardBlock>
        <CardBlock.Header
          title="Shutdown"
          titleId={titleId}
          description="How the instance is powered down when stopped or rebooted"
        />
        <CardBlock.Body>
          <ShutdownPolicyField
            control={form.control}
            actionName="shutdownAction"
            timeoutName="shutdownTimeoutSecs"
          />
          <p className="text-secondary max-w-lg">
            Power button signals the guest OS to shut down cleanly and cuts power if it
            hasn’t stopped by the timeout. Timeout changes don’t apply to an instance that
            is already shutting down.
          </p>
        </CardBlock.Body>
        <CardBlock.Footer>
          <LearnMore doc={docLinks.instanceActions} />
          <Button size="sm" type="submit" disabled={disableSubmit}>
            Save
          </Button>
        </CardBlock.Footer>
      </CardBlock>
    </form>
  )
}
