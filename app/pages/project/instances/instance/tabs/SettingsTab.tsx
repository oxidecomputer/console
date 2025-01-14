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

import { apiQueryClient, useApiMutation, usePrefetchedApiQuery } from '~/api'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { useInstanceSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { Button } from '~/ui/lib/Button'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { LearnMore, SettingsGroup } from '~/ui/lib/SettingsGroup'
import { TipIcon } from '~/ui/lib/TipIcon'
import { useInterval } from '~/ui/lib/use-interval'
import { links } from '~/util/links'

Component.displayName = 'SettingsTab'
export function Component() {
  const instanceSelector = useInstanceSelector()

  const [now, setNow] = useState(new Date())

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

  const form = useForm({
    defaultValues: {
      autoRestartPolicy: instance.autoRestartPolicy,
    },
  })
  const { isDirty } = form.formState

  const onSubmit = form.handleSubmit((values) => {
    instanceUpdate.mutate({
      path: { instance: instanceSelector.instance },
      query: { project: instanceSelector.project },
      body: {
        ncpus: instance.ncpus,
        memory: instance.memory,
        bootDisk: instance.bootDiskId,
        autoRestartPolicy: values.autoRestartPolicy,
      },
    })
  })

  return (
    <form className="space-y-6" onSubmit={onSubmit}>
      <SettingsGroup.Container>
        <SettingsGroup.Header>
          <SettingsGroup.Title>Auto-restart</SettingsGroup.Title>
          <p>The auto-restart policy configured for this instance</p>
        </SettingsGroup.Header>
        <SettingsGroup.Body>
          <ListboxField
            control={form.control}
            name="autoRestartPolicy"
            label="Policy"
            description="If unconfigured, this instance uses the default auto-restart policy, which may or may not allow it to be restarted."
            placeholder="Default"
            items={[
              { value: '', label: 'Default' },
              { value: 'never', label: 'Never' },
              { value: 'best_effort', label: 'Best effort' },
            ]}
            required
            className="max-w-none"
          />
          <FormMeta
            label="Enabled"
            helpText="If enabled this instance will automatically restart it if it enters the Failed state."
          >
            {instance.autoRestartEnabled ? 'True' : 'False'}{' '}
            {instance.autoRestartEnabled && !instance.autoRestartPolicy && (
              <span className="text-tertiary">(Project default)</span>
            )}
          </FormMeta>
          <FormMeta
            label="Cooldown expiration"
            helpText="The time at which the auto-restart cooldown period for this instance completes. If n/a, then either the instance has never been automatically restarted, or the cooldown period has already expired"
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
              <span className="text-tertiary">n/a</span>
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
              <span className="text-tertiary">n/a</span>
            )}
          </FormMeta>
        </SettingsGroup.Body>
        <SettingsGroup.Footer>
          <div>
            <LearnMore text="Auto-Restart" href={links.sshDocs} />
          </div>
          <Button size="sm" type="submit" disabled={!isDirty}>
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
