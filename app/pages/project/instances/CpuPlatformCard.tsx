/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import { api, q, queryClient, useApiMutation, usePrefetchedQuery } from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { CardBlock, LearnMore } from '~/ui/lib/CardBlock'
import { cpuPlatformItems, type FormCpuPlatform } from '~/util/cpu-platform'
import { docLinks } from '~/util/links'

type FormValues = {
  cpuPlatform: FormCpuPlatform
}

export function CpuPlatformCard() {
  const instanceSelector = useInstanceSelector()

  const { data: instance } = usePrefetchedQuery(
    q(api.instanceView, {
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
    })
  )

  const instanceUpdate = useApiMutation(api.instanceUpdate, {
    onSuccess() {
      queryClient.invalidateEndpoint('instanceView')
      addToast({ content: 'CPU platform preference updated' })
    },
    onError(err) {
      addToast({
        title: 'Could not update CPU platform preference',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const cpuPlatform: FormCpuPlatform = instance.cpuPlatform || 'none'
  const defaultValues: FormValues = { cpuPlatform }

  const form = useForm({ defaultValues })

  const disableSubmit = form.watch('cpuPlatform') === cpuPlatform

  const onSubmit = form.handleSubmit((values) => {
    instanceUpdate.mutate({
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
      body: {
        cpuPlatform: match(values.cpuPlatform)
          .with('none', () => null)
          .with('amd_milan', () => 'amd_milan' as const)
          .with('amd_turin', () => 'amd_turin' as const)
          .exhaustive(),
        ncpus: instance.ncpus,
        memory: instance.memory,
        autoRestartPolicy: instance.autoRestartPolicy || null,
        bootDisk: instance.bootDiskId || null,
      },
    })
  })

  return (
    <form onSubmit={onSubmit}>
      <CardBlock>
        <CardBlock.Header title="CPU platform" />
        <CardBlock.Body>
          <ListboxField
            control={form.control}
            name="cpuPlatform"
            label="Preference"
            description="If a CPU platform is specified, the instance will only be placed on compatible hosts."
            items={cpuPlatformItems}
            className="max-w-lg"
            required
          />
        </CardBlock.Body>
        <CardBlock.Footer>
          <LearnMore doc={docLinks.cpuPlatform} />
          <Button size="sm" type="submit" disabled={disableSubmit}>
            Save
          </Button>
        </CardBlock.Footer>
      </CardBlock>
    </form>
  )
}
