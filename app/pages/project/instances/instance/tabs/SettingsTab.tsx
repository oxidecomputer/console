/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { formatDistanceToNow } from 'date-fns'
import { type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import { apiQueryClient, useApiMutation, usePrefetchedApiQuery } from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { type ListboxItem } from '~/ui/lib/Listbox'
import { LearnMore, SettingsGroup } from '~/ui/lib/SettingsGroup'
import { TipIcon } from '~/ui/lib/TipIcon'
import { toLocaleDateTimeString } from '~/util/date'
import { links } from '~/util/links'

type FormPolicy = 'default' | 'never' | 'best_effort'

const restartPolicyItems: ListboxItem<FormPolicy>[] = [
  { value: 'default', label: 'Default' },
  { value: 'never', label: 'Never' },
  { value: 'best_effort', label: 'Best effort' },
]

type FormValues = {
  autoRestartPolicy: FormPolicy
}

Component.displayName = 'SettingsTab'
export function Component() {
  const instanceSelector = useInstanceSelector()

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceSelector.instance },
    query: { project: instanceSelector.project },
  })

  const instanceUpdate = useApiMutation('instanceUpdate', {
    onSuccess() {
      apiQueryClient.invalidateQueries('instanceView')
      addToast({ content: 'Instance auto-restart policy updated' })
    },
    onError(err) {
      addToast({
        title: 'Could not update auto-restart policy',
        content: err.message,
        variant: 'error',
      })
    },
  })

  const autoRestartPolicy = instance.autoRestartPolicy || 'default'
  const defaultValues: FormValues = { autoRestartPolicy }

  const form = useForm({ defaultValues })

  // note there are no instance state-based restrictions on updating auto
  // restart, so there is no instanceCan helper for it
  // https://github.com/oxidecomputer/omicron/blob/0c6ab099e/nexus/db-queries/src/db/datastore/instance.rs#L1050-L1058
  const disableSubmit = form.watch('autoRestartPolicy') === autoRestartPolicy

  const onSubmit = form.handleSubmit((values) => {
    instanceUpdate.mutate({
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
      body: {
        ncpus: instance.ncpus,
        memory: instance.memory,
        bootDisk: instance.bootDiskId,
        autoRestartPolicy: match(values.autoRestartPolicy)
          .with('default', () => undefined)
          .with('never', () => 'never' as const)
          .with('best_effort', () => 'best_effort' as const)
          .exhaustive(),
      },
    })
  })

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <SettingsGroup.Container>
        <SettingsGroup.Header>
          <SettingsGroup.Title>Auto-restart</SettingsGroup.Title>
          <p>The auto-restart policy for this instance</p>
        </SettingsGroup.Header>
        <SettingsGroup.Body>
          <ListboxField
            control={form.control}
            name="autoRestartPolicy"
            label="Policy"
            description="The global default is currently best effort, but this may change in the future."
            items={restartPolicyItems}
            required
            className="max-w-none"
          />
          <FormMeta
            label="Cooldown expiration"
            tip="When this instance will next restart (if in a failed state and the policy allows it). If N/A, then either the instance has never been automatically restarted, or the cooldown period has expired."
          >
            {instance.autoRestartCooldownExpiration ? (
              <>
                {toLocaleDateTimeString(instance.autoRestartCooldownExpiration)}{' '}
                {instance.runState === 'failed' && instance.autoRestartEnabled && (
                  <span className="text-tertiary">
                    (
                    {instance.autoRestartCooldownExpiration < new Date()
                      ? 'restarting soon'
                      : formatDistanceToNow(instance.autoRestartCooldownExpiration)}
                    )
                  </span>
                )}
              </>
            ) : (
              <span className="text-tertiary">N/A</span>
            )}
          </FormMeta>
          <FormMeta
            label="Last auto-restarted"
            tip="When this instance was last automatically restarted. N/A if never auto-restarted."
          >
            {instance.timeLastAutoRestarted ? (
              toLocaleDateTimeString(instance.timeLastAutoRestarted)
            ) : (
              <span className="text-tertiary">N/A</span>
            )}
          </FormMeta>
        </SettingsGroup.Body>
        <SettingsGroup.Footer>
          <div>
            <LearnMore text="Auto-Restart" href={links.instanceUpdateDocs} />
          </div>
          <Button size="sm" type="submit" disabled={disableSubmit}>
            Save
          </Button>
        </SettingsGroup.Footer>
      </SettingsGroup.Container>
    </form>
  )
}

type FormMetaProps = {
  label: string
  tip?: string
  children: ReactNode
}

const FormMeta = ({ label, tip, children }: FormMetaProps) => (
  <div>
    <div className="mb-2 flex items-center gap-1 border-b pb-2 text-sans-md border-secondary">
      <div>{label}</div>
      {tip && <TipIcon>{tip}</TipIcon>}
    </div>
    {children}
  </div>
)
