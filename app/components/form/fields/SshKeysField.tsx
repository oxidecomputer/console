/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useController, type Control } from 'react-hook-form'

import { usePrefetchedApiQuery } from '@oxide/api'
import { EmptyMessage, Key16Icon, Message } from '@oxide/ui'

import type { InstanceCreateInput } from 'app/forms/instance-create'

import { CheckboxGroupField } from './CheckboxGroupField'

export function SshKeysField({ control }: { control: Control<InstanceCreateInput> }) {
  const keys = usePrefetchedApiQuery('currentUserSshKeyList', {}).data?.items || []

  const {
    field: { onChange },
  } = useController({ control, name: 'sshKeys' })

  return (
    <div className="max-w-lg">
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
      {keys.length > 0 ? (
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
      ) : (
        <div className="mt-4 flex max-w-lg items-center justify-center rounded-lg border p-6 border-default">
          <EmptyMessage
            icon={<Key16Icon />}
            title="No SSH keys"
            body="You need to add a SSH key to be able to see it here"
          />
        </div>
      )}
    </div>
  )
}
