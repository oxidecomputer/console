/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { format, formatDistanceToNow } from 'date-fns'
import { useId, useState, type ReactNode } from 'react'
import { useForm } from 'react-hook-form'
import { match } from 'ts-pattern'

import { apiQueryClient, useApiMutation, usePrefetchedApiQuery } from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { type ListboxItem } from '~/ui/lib/Listbox'
import { LearnMore, SettingsGroup } from '~/ui/lib/SettingsGroup'
import { TipIcon } from '~/ui/lib/TipIcon'
import { useInterval } from '~/ui/lib/use-interval'
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

  const [now, setNow] = useState(new Date())

  // TODO: see if we can tweak the polling condition to include
  // failed + cooling down and just rely on polling
  useInterval({ fn: () => setNow(new Date()), delay: 1000 })

  const { data: instance } = usePrefetchedApiQuery('instanceView', {
    path: { instance: instanceSelector.instance },
    query: { project: instanceSelector.project },
  })

  const instanceUpdate = useApiMutation('instanceUpdate', {
    onSuccess() {
      apiQueryClient.invalidateQueries('instanceView')
      addToast({ content: 'Instance auto-restart policy updated' })
    },
  })

  const autoRestartPolicy = instance.autoRestartPolicy || 'default'
  const defaultValues: FormValues = { autoRestartPolicy }

  const form = useForm({ defaultValues })

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
            description="If unconfigured, this instance uses the default auto-restart policy, which may or may not allow it to be restarted."
            placeholder="Default"
            items={restartPolicyItems}
            required
            className="max-w-none"
          />
          <FormMeta
            label="Enabled"
            helpText="If enabled, this instance will automatically restart if it enters the Failed state."
          >
            {instance.autoRestartEnabled ? 'True' : 'False'}{' '}
            {instance.autoRestartEnabled && !instance.autoRestartPolicy && (
              <span className="text-tertiary">(Project default)</span>
            )}
          </FormMeta>
          <FormMeta
            label="Cooldown expiration"
            helpText="The time at which the auto-restart cooldown period for this instance completes. If N/A, then either the instance has never been automatically restarted, or the cooldown period has already expired"
          >
            {instance.autoRestartCooldownExpiration ? (
              <>
                {format(
                  new Date(instance.autoRestartCooldownExpiration),
                  'MMM d, yyyy HH:mm:ss zz'
                )}{' '}
                {new Date(instance.autoRestartCooldownExpiration) > now && (
                  <span className="text-tertiary">
                    ({formatDistanceToNow(new Date(instance.autoRestartCooldownExpiration))}
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
            helpText="When this instance was last automatically restarted. Empty if never auto-restarted."
          >
            {instance.timeLastAutoRestarted ? (
              <>
                {format(
                  new Date(instance.timeLastAutoRestarted),
                  'MMM d, yyyy HH:mm:ss zz'
                )}
              </>
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

const FormMeta = ({
  label,
  helpText,
  children,
}: {
  label: string
  helpText?: string
  children: ReactNode
}) => {
  const id = useId()
  return (
    <div>
      <div className="mb-2 flex items-center gap-1 border-b pb-2 border-secondary">
        <FieldLabel id={`${id}-label`} htmlFor={id}>
          {label}
        </FieldLabel>
        {helpText && <TipIcon>{helpText}</TipIcon>}
      </div>
      {children}
    </div>
  )
}
