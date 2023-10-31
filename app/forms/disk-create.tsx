/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { format } from 'date-fns'
import { useController, type Control } from 'react-hook-form'
import { useNavigate, type NavigateFunction } from 'react-router-dom'

import {
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type BlockSize,
  type Disk,
  type DiskCreate,
  type DiskSource,
} from '@oxide/api'
import { FieldLabel, FormDivider, Radio, RadioGroup } from '@oxide/ui'
import { GiB } from '@oxide/util'

import {
  DescriptionField,
  DiskSizeField,
  ListboxField,
  NameField,
  RadioField,
  SideModalForm,
  toListboxItem,
} from 'app/components/form'
import { useForm, useProjectSelector, useToast } from 'app/hooks'

const blankDiskSource: DiskSource = {
  type: 'blank',
  blockSize: 512,
}

const defaultValues: DiskCreate = {
  name: '',
  description: '',
  size: 10,
  diskSource: blankDiskSource,
}

type CreateSideModalFormProps = {
  /**
   * If defined, this overrides the usual mutation. Caller is responsible for
   * doing a dismiss behavior in onSubmit as well, because we are not calling
   * the RQ `onSuccess` defined for the mutation.
   */
  onSubmit?: (diskCreate: DiskCreate) => void
  /**
   * Passing navigate is a bit of a hack to be able to do a nav from the routes
   * file. The callers that don't need the arg can ignore it.
   */
  onDismiss: (navigate: NavigateFunction) => void
  onSuccess?: (disk: Disk) => void
}

export function CreateDiskSideModalForm({
  onSubmit,
  onSuccess,
  onDismiss,
}: CreateSideModalFormProps) {
  const queryClient = useApiQueryClient()
  const projectSelector = useProjectSelector()
  const addToast = useToast()
  const navigate = useNavigate()

  const createDisk = useApiMutation('diskCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('diskList')
      addToast({ content: 'Your disk has been created' })
      onSuccess?.(data)
      onDismiss(navigate)
    },
  })

  const form = useForm({ defaultValues })

  return (
    <SideModalForm
      id="create-disk-form"
      title="Create Disk"
      form={form}
      onDismiss={() => onDismiss(navigate)}
      onSubmit={({ size, ...rest }) => {
        const body = { size: size * GiB, ...rest }
        onSubmit ? onSubmit(body) : createDisk.mutate({ query: projectSelector, body })
      }}
      loading={createDisk.isPending}
      submitError={createDisk.error}
    >
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />
      <DiskSourceField control={form.control} />
      <DiskSizeField name="size" control={form.control} />
    </SideModalForm>
  )
}

const DiskSourceField = ({ control }: { control: Control<DiskCreate> }) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: 'diskSource' })

  return (
    <>
      <div className="max-w-lg space-y-2">
        <FieldLabel id="disk-source-label">Source</FieldLabel>
        <RadioGroup
          aria-labelledby="disk-source-label"
          name="diskSource"
          column
          defaultChecked={value.type}
          onChange={(event) => {
            const newType = event.target.value as DiskCreate['diskSource']['type']

            // need to include blockSize when switching back to blank
            onChange(newType === 'blank' ? blankDiskSource : { type: newType })
          }}
        >
          <Radio value="blank">Blank</Radio>
          <Radio value="snapshot">Snapshot</Radio>
          <Radio value="image">Image</Radio>
        </RadioGroup>
      </div>
      <div className="max-w-lg">
        {value.type === 'blank' && (
          <RadioField
            column
            name="diskSource.blockSize"
            label="Block size"
            units="Bytes"
            control={control}
            parseValue={(val) => parseInt(val, 10) as BlockSize}
            items={[
              { label: '512', value: 512 },
              { label: '2048', value: 2048 },
              { label: '4096', value: 4096 },
            ]}
          />
        )}
        {value.type === 'image' && <ImageSelectField control={control} />}

        {value.type === 'snapshot' && <SnapshotSelectField control={control} />}
      </div>
    </>
  )
}

const ImageSelectField = ({ control }: { control: Control<DiskCreate> }) => {
  const { project } = useProjectSelector()

  const projectImages = useApiQuery('imageList', { query: { project } })
  const siloImages = useApiQuery('imageList', {})

  // put project images first because if there are any, there probably aren't
  // very many and they're probably relevant
  const images = [...(projectImages.data?.items || []), ...(siloImages.data?.items || [])]

  return (
    <ListboxField
      control={control}
      name="diskSource.imageId"
      label="Source image"
      placeholder="Select an image"
      isLoading={projectImages.isPending || siloImages.isPending}
      items={images.map((i) => toListboxItem(i, true))}
      required
    />
  )
}

const DiskNameFromId = ({ disk }: { disk: string }) => {
  const { data, isPending, isError } = useApiQuery(
    'diskView',
    { path: { disk } },
    // this can 404 if the source disk has been deleted, and that's fine
    { throwOnError: false }
  )

  if (isPending || isError) return null
  return <> from {data.name}</>
}

const SnapshotSelectField = ({ control }: { control: Control<DiskCreate> }) => {
  const projectSelector = useProjectSelector()

  const snapshotsQuery = useApiQuery('snapshotList', { query: projectSelector })

  const snapshots = snapshotsQuery.data?.items || []

  return (
    <ListboxField
      control={control}
      name="diskSource.snapshotId"
      label="Source snapshot"
      placeholder="Select a snapshot"
      items={snapshots.map((i) => {
        return {
          value: i.id,
          labelString: `${i.name}`,
          label: (
            <>
              <div>{i.name}</div>
              <div className="text-secondary">
                Created on {format(i.timeCreated, 'MMM d, yyyy')}
                <DiskNameFromId disk={i.diskId} />
              </div>
            </>
          ),
        }
      })}
      isLoading={snapshotsQuery.isPending}
      required
    />
  )
}
