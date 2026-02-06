/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'

import {
  api,
  diskCan,
  q,
  queryClient,
  useApiMutation,
  type SnapshotCreate,
} from '@oxide/api'

import { ComboboxField } from '~/components/form/fields/ComboboxField'
import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { NameField } from '~/components/form/fields/NameField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { titleCrumb } from '~/hooks/use-crumbs'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { toComboboxItems } from '~/ui/lib/Combobox'
import { SideModalFormDocs } from '~/ui/lib/ModalLinks'
import { ALL_ISH } from '~/util/consts'
import { docLinks } from '~/util/links'
import { pb } from '~/util/path-builder'
import type * as PP from '~/util/path-params'

const useSnapshotDiskItems = ({ project }: PP.Project) => {
  const { data: disks } = useQuery(q(api.diskList, { query: { project, limit: ALL_ISH } }))
  return disks?.items.filter(diskCan.snapshot)
}

const defaultValues: SnapshotCreate = {
  description: '',
  disk: '',
  name: '',
}

export const handle = titleCrumb('New snapshot')

export default function SnapshotCreate() {
  const projectSelector = useProjectSelector()
  const navigate = useNavigate()

  const diskItems = useSnapshotDiskItems(projectSelector)
  const diskItemsForCombobox = useMemo(() => toComboboxItems(diskItems), [diskItems])

  const onDismiss = () => navigate(pb.snapshots(projectSelector))

  const createSnapshot = useApiMutation(api.snapshotCreate, {
    onSuccess(snapshot) {
      queryClient.invalidateEndpoint('snapshotList')
      // prettier-ignore
      addToast(<>Snapshot <HL>{snapshot.name}</HL> created</>)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="snapshot"
      onDismiss={onDismiss}
      onSubmit={(values) => {
        createSnapshot.mutate({ query: projectSelector, body: values })
      }}
      submitError={createSnapshot.error}
      loading={createSnapshot.isPending}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <ComboboxField
        label="Disk"
        name="disk"
        placeholder="Select a disk"
        items={diskItemsForCombobox}
        required
        control={form.control}
      />
      <SideModalFormDocs docs={[docLinks.snapshots]} />
    </SideModalForm>
  )
}
