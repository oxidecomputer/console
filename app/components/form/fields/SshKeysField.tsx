/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect, useState } from 'react'
import {
  useController,
  useWatch,
  type Control,
  type UseFormClearErrors,
} from 'react-hook-form'

import { usePrefetchedApiQuery } from '@oxide/api'
import {
  Button,
  Checkbox,
  Divider,
  EmptyMessage,
  FieldLabel,
  Key16Icon,
  Message,
  TextInputHint,
} from '@oxide/ui'

import type { InstanceCreateInput } from 'app/forms/instance-create'
import { CreateSSHKeySideModalForm } from 'app/forms/ssh-key-create'

import { CheckboxField } from '..'

const MAX_KEYS_PER_INSTANCE = 8

export function SshKeysField({
  control,
  clearErrors,
}: {
  control: Control<InstanceCreateInput>
  clearErrors: UseFormClearErrors<InstanceCreateInput>
}) {
  const keys = usePrefetchedApiQuery('currentUserSshKeyList', {}).data?.items || []
  const [showAddSshKey, setShowAddSshKey] = useState(false)

  const {
    field: { value, onChange },
  } = useController({
    control,
    name: 'sshKeys',
    rules: {
      validate(props) {
        console.log(props)
        return undefined
      },
    },
  })

  const sshKeys = useWatch({
    control,
    name: 'sshKeys',
    defaultValue: [],
  })

  useEffect(() => {
    // todo: find some way to ensure that this is not out of date with the omicron limit
    if (sshKeys && sshKeys.length > MAX_KEYS_PER_INSTANCE) {
      control.setError('sshKeys', {
        type: 'manual',
        message: `An instance supports a maximum of ${MAX_KEYS_PER_INSTANCE} SSH keys`,
      })
    } else {
      clearErrors()
    }
  }, [sshKeys, control, clearErrors])

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
                <CheckboxField name="sshKeys" control={control} value={key.id} key={key.id}>
                  {key.name}
                </CheckboxField>
              ))}
            </div>

            <Divider />
            <Checkbox
              checked={value && value.length === keys.length}
              indeterminate={value && value.length > 0 && value.length < keys.length}
              onChange={() => {
                const count = value ? value.length : 0
                if (count < keys.length) {
                  // check all
                  onChange(keys.map((key) => key.id))
                } else {
                  // uncheck all
                  onChange([])
                }
              }}
            >
              <span className="select-none">Select all</span>
            </Checkbox>

            <div className="space-x-3">
              <Button variant="ghost" size="sm" onClick={() => setShowAddSshKey(true)}>
                Add SSH Key
              </Button>
            </div>
          </div>
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
                , the keys above will be added to your instance. Keys are added when the
                instance is created and are not updated after instance launch.
              </>
            }
          />
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
