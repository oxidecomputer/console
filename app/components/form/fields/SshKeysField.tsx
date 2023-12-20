/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState } from 'react'
import { useController, type Control } from 'react-hook-form'

import { usePrefetchedApiQuery } from '@oxide/api'
import {
  Checkbox,
  CheckboxGroup,
  EmptyMessage,
  FieldLabel,
  Key16Icon,
  Message,
  TextInput,
  TextInputHint,
} from '@oxide/ui'

import type { InstanceCreateInput } from 'app/forms/instance-create'

export function SshKeysField({ control }: { control: Control<InstanceCreateInput> }) {
  const keys = usePrefetchedApiQuery('currentUserSshKeyList', {}).data?.items || []
  const [newSshKey, setNewSshKey] = useState(false)

  const {
    field: { value, onChange },
  } = useController({ control, name: 'publicKeys' })

  return (
    <div className="max-w-lg">
      <div className="mb-2">
        <FieldLabel id="ssh-keys-label">SSH keys</FieldLabel>
        <TextInputHint id="ssh-keys-label-help-text">
          SSH keys can be added and removed in your user settings
        </TextInputHint>
      </div>

      {keys.length > 0 ? (
        <Message
          variant="notice"
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
              , the keys above will be added to your instance. Keys are added when the
              instance is created and are not updated after instance launch.
            </>
          }
        />
      ) : (
        <div className="mb-4 flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to add a SSH key to be able to see it here"
          />
        </div>
      )}
      <CheckboxGroup name="ssh-keys" column className="mt-4">
        {[
          ...keys.map((key) => (
            <Checkbox
              key={key.id}
              value={key.id}
              onChange={(e) => {
                const { checked } = e.target
                let newValue = [...value]
                if (checked) {
                  newValue.push({ type: 'user-key', key: key.id })
                } else {
                  newValue = newValue.filter((k) => 'key' in k && k.key !== key.id)
                }
                onChange(newValue)
              }}
              checked={value.some((k) => 'key' in k && k.key === key.id)}
            >
              {key.name}
            </Checkbox>
          )),
          <Checkbox
            key="new"
            value="New SSH Key"
            checked={newSshKey}
            onChange={(e) => {
              setNewSshKey(e.target.checked)
            }}
          >
            New SSH Key
            <div className="mt-1 text-sans-sm text-tertiary">
              One-off key saved to this instance and not added to your profile’s SSH keys
            </div>
            {newSshKey && (
              <TextInput
                as="textarea"
                rows={5}
                placeholder="Enter your SSH key"
                className="mt-2"
                onChange={(e) => {
                  const val = e.target.value
                  let newValue = [...value]
                  newValue = newValue.filter((k) => 'key' in k && k.type !== 'string')
                  newValue.push({ type: 'string', key: val })
                  onChange(newValue)
                }}
              />
            )}
          </Checkbox>,
        ]}
      </CheckboxGroup>
    </div>
  )
}
