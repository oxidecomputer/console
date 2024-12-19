/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import { useNavigate, type LoaderFunctionArgs } from 'react-router-dom'

import { apiQueryClient, usePrefetchedApiQuery } from '@oxide/api'
import { Key16Icon } from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { getSshKeySelector, useSshKeySelector } from '~/hooks/use-params'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { pb } from '~/util/path-builder'

EditSSHKeySideModalForm.loader = async ({ params }: LoaderFunctionArgs) => {
  const { sshKey } = getSshKeySelector(params)
  await apiQueryClient.prefetchQuery('currentUserSshKeyView', { path: { sshKey } })
  return null
}

export function EditSSHKeySideModalForm() {
  const navigate = useNavigate()
  const { sshKey } = useSshKeySelector()

  const { data } = usePrefetchedApiQuery('currentUserSshKeyView', {
    path: { sshKey },
  })

  const form = useForm({ defaultValues: data })

  return (
    <SideModalForm
      form={form}
      formType="edit"
      resourceName="SSH key"
      title="View SSH key"
      onDismiss={() => navigate(pb.sshKeys())}
      subtitle={
        <ResourceLabel>
          <Key16Icon /> {data.name}
        </ResourceLabel>
      }
      // TODO: pass actual error when this form is hooked up
      loading={false}
      submitError={null}
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={data.id} />
        <PropertiesTable.DateRow date={data.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={data.timeModified} label="Updated" />
      </PropertiesTable>
      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} disabled />
      <div className="relative">
        <CopyToClipboard className="!absolute right-0 top-0" text={data.publicKey} />
        <TextField
          as="textarea"
          name="publicKey"
          label="Public key"
          required
          rows={8}
          control={form.control}
          disabled
        />
      </div>
    </SideModalForm>
  )
}
