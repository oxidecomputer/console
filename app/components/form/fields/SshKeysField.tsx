/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Button } from 'libs/ui/lib/button/Button'
import { Checkbox } from 'libs/ui/lib/checkbox/Checkbox'
import { Divider } from 'libs/ui/lib/divider/Divider'
import { EmptyMessage } from 'libs/ui/lib/empty-message/EmptyMessage'
import { FieldLabel } from 'libs/ui/lib/field-label/FieldLabel'
import { useState } from 'react'
import { useController, type Control } from 'react-hook-form'

import { usePrefetchedApiQuery } from '@oxide/api'
import { Key16Icon, Message, TextInputHint } from '@oxide/ui'

import type { InstanceCreateInput } from 'app/forms/instance-create'
import { CreateSSHKeySideModalForm } from 'app/forms/ssh-key-create'

import { CheckboxField } from './CheckboxField'
import { ErrorMessage } from './ErrorMessage'

// todo: keep this in sync with the limit set in the control plane
const MAX_KEYS_PER_INSTANCE = 100

const CloudInitMessage = () => (
  <Message
    variant="notice"
    className="mt-4"
    content={
      <>
        If your image supports the cidata volume and{' '}
        <a
          target="_blank"
          href="https://cloudinit.readthedocs.io/en/latest/"
          rel="noreferrer"
        >
          cloud-init
        </a>
        , the keys above will be added to your instance. Keys are added when the instance is
        created and are not updated after instance launch.
      </>
    }
  />
)

export function SshKeysField({ control }: { control: Control<InstanceCreateInput> }) {
  const keys = usePrefetchedApiQuery('currentUserSshKeyList', {}).data?.items || []
  const [showAddSshKey, setShowAddSshKey] = useState(false)

  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({
    control,
    name: 'sshPublicKeys',
    rules: {
      validate(keys) {
        if (keys.length > MAX_KEYS_PER_INSTANCE) {
          return `An instance supports a maximum of ${MAX_KEYS_PER_INSTANCE} SSH keys`
        }
      },
    },
  })

  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id="ssh-keys-label">SSH keys</FieldLabel>
        <TextInputHint id="ssh-keys-help-text">
          SSH keys can be added and removed in your user settings
        </TextInputHint>
      </div>
      {keys.length > 0 ? (
        <>
          <div className="space-y-2">
            <div className="flex flex-col space-y-2">
              {keys.map((key) => (
                <CheckboxField
                  name="sshPublicKeys"
                  control={control}
                  value={key.id}
                  key={key.id}
                >
                  {key.name}
                </CheckboxField>
              ))}
            </div>

            <ErrorMessage error={error} label="SSH keys" />

            <Divider />
            <Checkbox
              checked={value.length === keys.length}
              indeterminate={value.length > 0 && value.length < keys.length}
              // if fewer than all are checked, check all. if all are checked, check none
              onChange={() =>
                onChange(value.length < keys.length ? keys.map((key) => key.id) : [])
              }
            >
              <span className="select-none">Select all</span>
            </Checkbox>

            <div className="space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setShowAddSshKey(true)}>
                Add SSH Key
              </Button>
            </div>
          </div>
          <CloudInitMessage />
        </>
      ) : (
        <div className="mt-4 flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to add a SSH key to be able to see it here"
          />
        </div>
      )}
      {showAddSshKey && (
        <CreateSSHKeySideModalForm
          onDismiss={() => setShowAddSshKey(false)}
          message={
            <Message
              variant="info"
              content="SSH keys added here are permanently associated with your profile, and will be available for future use"
            />
          }
        />
      )}
    </div>
  )
}
