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
import { Button, Checkbox, Divider, EmptyMessage, Key16Icon, Message } from '@oxide/ui'

import type { InstanceCreateInput } from 'app/forms/instance-create'
import { CreateSSHKeySideModalForm } from 'app/forms/ssh-key-create'

import { CheckboxGroupField } from './CheckboxGroupField'

export function SshKeysField({ control }: { control: Control<InstanceCreateInput> }) {
  const keys = usePrefetchedApiQuery('currentUserSshKeyList', {}).data?.items || []
  const [showAddSshKey, setShowAddSshKey] = useState(false)

  const {
    field: { value, onChange },
  } = useController({ control, name: 'sshKeys' })

  return (
    <div className="max-w-lg">
      {keys.length > 0 ? (
        <>
          <div className="space-y-2">
            <CheckboxGroupField
              name="sshKeys"
              label="SSH keys"
              description="SSH keys can be added and removed in your user settings"
              column
              className="mt-4"
              items={keys.map((key) => ({ label: key.name, value: key.id }))}
              control={control}
              onChange={onChange}
            />
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
