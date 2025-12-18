/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useForm } from 'react-hook-form'
import {
  NavigationType,
  useNavigate,
  useNavigationType,
  type LoaderFunctionArgs,
} from 'react-router'

import { api, q, queryClient, usePrefetchedQuery } from '@oxide/api'
import { Key16Icon } from '@oxide/design-system/icons/react'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { TextField } from '~/components/form/fields/TextField'
import { ReadOnlySideModalForm } from '~/components/form/ReadOnlySideModalForm'
import { titleCrumb } from '~/hooks/use-crumbs'
import { getSshKeySelector, useSshKeySelector } from '~/hooks/use-params'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { PropertiesTable } from '~/ui/lib/PropertiesTable'
import { ResourceLabel } from '~/ui/lib/SideModal'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const sshKeyView = ({ sshKey }: PP.SshKey) =>
  q(api.currentUserSshKeyView, { path: { sshKey } })

export async function clientLoader({ params }: LoaderFunctionArgs) {
  const selector = getSshKeySelector(params)
  await queryClient.prefetchQuery(sshKeyView(selector))
  return null
}

export const handle = titleCrumb('View SSH Key')

export default function EditSSHKeySideModalForm() {
  const navigate = useNavigate()
  const selector = useSshKeySelector()

  const { data } = usePrefetchedQuery(sshKeyView(selector))

  const form = useForm({ defaultValues: data })
  const onDismiss = () => navigate(pb.sshKeys())
  const animate = useNavigationType() === NavigationType.Push

  return (
    <ReadOnlySideModalForm
      title="View SSH key"
      onDismiss={onDismiss}
      animate={animate}
      subtitle={
        <ResourceLabel>
          <Key16Icon /> {data.name}
        </ResourceLabel>
      }
    >
      <PropertiesTable>
        <PropertiesTable.IdRow id={data.id} />
        <PropertiesTable.DateRow date={data.timeCreated} label="Created" />
        <PropertiesTable.DateRow date={data.timeModified} label="Updated" />
      </PropertiesTable>
      <NameField name="name" control={form.control} disabled />
      <DescriptionField name="description" control={form.control} disabled />
      <div className="relative">
        <CopyToClipboard className="absolute! top-0 right-0" text={data.publicKey} />
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
    </ReadOnlySideModalForm>
  )
}
