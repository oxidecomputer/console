/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '~/api'
import { CheckboxField } from '~/components/form/fields/CheckboxField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { CardBlock, LearnMore } from '~/ui/lib/CardBlock'
import { docLinks } from '~/util/links'

type FormValues = {
  enableJumboFrames: boolean
}

export function JumboFramesCard() {
  const instanceSelector = useInstanceSelector()

  const { data: instance } = usePrefetchedQuery(
    q(api.instanceView, {
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
    })
  )

  const instanceUpdate = useApiMutation(api.instanceUpdate, {
    onSuccess(instance) {
      const verb = instance.enableJumboFrames ? 'enabled' : 'disabled'
      queryClient.invalidateEndpoint('instanceView')
      addToast({ content: `Jumbo frames ${verb} for this instance` })
    },
    onError(err) {
      addToast({
        title: 'Could not update jumbo frames setting',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const defaultValues: FormValues = { enableJumboFrames: instance.enableJumboFrames }
  const form = useForm({ defaultValues })

  const disableSubmit = form.watch('enableJumboFrames') === instance.enableJumboFrames

  const onSubmit = form.handleSubmit((values) => {
    instanceUpdate.mutate({
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
      body: {
        enableJumboFrames: values.enableJumboFrames,
        autoRestartPolicy: instance.autoRestartPolicy || null,
        ncpus: instance.ncpus,
        memory: instance.memory,
        cpuPlatform: instance.cpuPlatform || null,
        bootDisk: instance.bootDiskId || null,
      },
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <CardBlock>
        <CardBlock.Header
          title="Jumbo frames"
          description="Use an 8500 byte MTU on the instance's primary network interface"
        />
        <CardBlock.Body>
          <CheckboxField name="enableJumboFrames" control={form.control}>
            Enable jumbo frames
          </CheckboxField>
          {/* fleet opt-in is fleet-admin-only to read, so we don't gate the
              checkbox on it; the API rejects the update if it's disabled */}
          <p className="text-sans-md text-tertiary">
            Can only be used if jumbo frames are enabled system-wide by the operator. Takes
            effect on next restart.
          </p>
        </CardBlock.Body>
        <CardBlock.Footer>
          <LearnMore doc={docLinks.jumboFrames} />
          <Button size="sm" type="submit" disabled={disableSubmit}>
            Save
          </Button>
        </CardBlock.Footer>
      </CardBlock>
    </form>
  )
}
