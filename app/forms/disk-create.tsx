/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'
import { filesize } from 'filesize'
import { useMemo } from 'react'
import { useController, useForm, type Control } from 'react-hook-form'

import {
  api,
  q,
  queryClient,
  useApiMutation,
  type BlockSize,
  type Disk,
  type DiskBackend,
  type DiskCreate,
  type DiskSource,
  type Image,
} from '@oxide/api'

import { DescriptionField } from '~/components/form/fields/DescriptionField'
import { DiskSizeField } from '~/components/form/fields/DiskSizeField'
import { toImageComboboxItem } from '~/components/form/fields/ImageSelectField'
import { ListboxField } from '~/components/form/fields/ListboxField'
import { NameField } from '~/components/form/fields/NameField'
import { RadioField } from '~/components/form/fields/RadioField'
import { SideModalForm } from '~/components/form/SideModalForm'
import { HL } from '~/components/HL'
import { useProjectSelector } from '~/hooks/use-params'
import { addToast } from '~/stores/toast'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Radio } from '~/ui/lib/Radio'
import { RadioGroup } from '~/ui/lib/RadioGroup'
import { Slash } from '~/ui/lib/Slash'
import { toLocaleDateString } from '~/util/date'
import { diskSizeNearest10 } from '~/util/math'
import { bytesToGiB, GiB } from '~/util/units'

const blankDiskSource: DiskSource = {
  type: 'blank',
  blockSize: 4096,
}

const defaultValues: DiskCreate = {
  name: '',
  description: '',
  size: 10,
  diskBackend: { type: 'distributed', diskSource: blankDiskSource },
}

type CreateSideModalFormProps = {
  /**
   * If defined, this overrides the usual mutation. Caller is responsible for
   * doing a dismiss behavior in onSubmit as well, because we are not calling
   * the RQ `onSuccess` defined for the mutation.
   */
  onSubmit?: (diskCreate: DiskCreate) => void
  onDismiss: () => void
  onSuccess?: (disk: Disk) => void
  unavailableDiskNames?: string[]
}

export function CreateDiskSideModalForm({
  onSubmit,
  onSuccess,
  onDismiss,
  unavailableDiskNames = [],
}: CreateSideModalFormProps) {
  const createDisk = useApiMutation(api.diskCreate, {
    onSuccess(data) {
      queryClient.invalidateEndpoint('diskList')
      // prettier-ignore
      addToast(<>Disk <HL>{data.name}</HL> created</>)
      onSuccess?.(data)
      onDismiss()
    },
  })

  const form = useForm({ defaultValues })
  const { project } = useProjectSelector()
  const projectImages = useQuery(q(api.imageList, { query: { project } }))
  const siloImages = useQuery(q(api.imageList, {}))

  // put project images first because if there are any, there probably aren't
  // very many and they're probably relevant
  const images = useMemo(
    () => [...(projectImages.data?.items || []), ...(siloImages.data?.items || [])],
    [projectImages.data, siloImages.data]
  )
  const areImagesLoading = projectImages.isPending || siloImages.isPending

  const snapshotsQuery = useQuery(q(api.snapshotList, { query: { project } }))
  const snapshots = snapshotsQuery.data?.items || []

  // validate disk source size
  const diskBackend = form.watch('diskBackend')
  const diskSourceType =
    diskBackend.type === 'distributed' ? diskBackend.diskSource.type : undefined

  let validateSizeGiB: number | undefined = undefined
  if (diskBackend.type === 'distributed') {
    const diskSource = diskBackend.diskSource
    if (diskSource.type === 'snapshot') {
      const selectedSnapshotSize = snapshots.find(
        (snapshot) => snapshot.id === diskSource.snapshotId
      )?.size
      validateSizeGiB = selectedSnapshotSize ? bytesToGiB(selectedSnapshotSize) : undefined
    } else if (diskSource.type === 'image') {
      const selectedImageSize = images.find(
        (image) => image.id === diskSource.imageId
      )?.size
      validateSizeGiB = selectedImageSize ? bytesToGiB(selectedImageSize) : undefined
    }
  }

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="disk"
      onDismiss={onDismiss}
      onSubmit={({ size, ...rest }) => {
        const body = { size: size * GiB, ...rest }
        if (onSubmit) {
          onSubmit(body)
        } else {
          createDisk.mutate({ query: { project }, body })
        }
      }}
      loading={createDisk.isPending}
      submitError={createDisk.error}
    >
      <NameField
        name="name"
        control={form.control}
        validate={(name: string) => {
          if (unavailableDiskNames.includes(name)) {
            return 'Name is already in use'
          }
        }}
      />
      <DescriptionField name="description" control={form.control} />
      <DiskSizeField
        name="size"
        control={form.control}
        validate={(diskSizeGiB: number) => {
          if (validateSizeGiB && diskSizeGiB < validateSizeGiB) {
            return `Must be as large as selected ${diskSourceType} (min. ${validateSizeGiB} GiB)`
          }
        }}
      />
      <DiskBackendField
        control={form.control}
        images={images}
        areImagesLoading={areImagesLoading}
      />
    </SideModalForm>
  )
}

const DiskBackendField = ({
  control,
  images,
  areImagesLoading,
}: {
  control: Control<DiskCreate>
  images: Image[]
  areImagesLoading: boolean
}) => {
  const {
    field: { value: diskBackend, onChange: setDiskBackend },
  } = useController({ control, name: 'diskBackend' })
  const diskSizeField = useController({ control, name: 'size' }).field

  return (
    <>
      <div className="max-w-lg space-y-2">
        <FieldLabel id="disk-type-label">Disk type</FieldLabel>
        <RadioGroup
          aria-labelledby="disk-type-label"
          name="diskBackendType"
          column
          defaultChecked={diskBackend.type}
          onChange={(event) => {
            const newType = event.target.value as DiskBackend['type']
            if (newType === 'local') {
              setDiskBackend({ type: 'local' })
            } else {
              setDiskBackend({ type: 'distributed', diskSource: blankDiskSource })
            }
          }}
        >
          <Radio value="distributed">Distributed</Radio>
          <Radio value="local">Local</Radio>
        </RadioGroup>
      </div>

      {diskBackend.type === 'distributed' && (
        <DiskSourceField
          control={control}
          diskSource={diskBackend.diskSource}
          setDiskSource={(source) =>
            setDiskBackend({ type: 'distributed', diskSource: source })
          }
          diskSizeField={diskSizeField}
          images={images}
          areImagesLoading={areImagesLoading}
        />
      )}
    </>
  )
}

const DiskSourceField = ({
  control,
  diskSource,
  setDiskSource,
  diskSizeField,
  images,
  areImagesLoading,
}: {
  control: Control<DiskCreate>
  diskSource: DiskSource
  setDiskSource: (source: DiskSource) => void
  diskSizeField: { value: number; onChange: (value: number) => void }
  images: Image[]
  areImagesLoading: boolean
}) => {
  return (
    <>
      <div className="max-w-lg space-y-2">
        <FieldLabel id="disk-source-label">Source</FieldLabel>
        <RadioGroup
          aria-labelledby="disk-source-label"
          name="diskSource"
          column
          defaultChecked={diskSource.type}
          onChange={(event) => {
            const newType = event.target.value as DiskSource['type']
            // need to include blockSize when switching back to blank. other
            // source types get their required fields from form inputs
            setDiskSource(
              newType === 'blank' ? blankDiskSource : ({ type: newType } as DiskSource)
            )
          }}
        >
          <Radio value="blank">Blank</Radio>
          <Radio value="snapshot">Snapshot</Radio>
          <Radio value="image">Image</Radio>
        </RadioGroup>
      </div>
      <div className="max-w-lg">
        {diskSource.type === 'blank' && (
          <RadioField
            column
            name="diskBackend.diskSource.blockSize"
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
        {diskSource.type === 'image' && (
          <ListboxField
            control={control}
            name="diskBackend.diskSource.imageId"
            label="Source image"
            placeholder="Select an image"
            isLoading={areImagesLoading}
            items={images.map((i) => toImageComboboxItem(i, true))}
            required
            onChange={(id) => {
              const image = images.find((i) => i.id === id)!
              const imageSizeGiB = image.size / GiB
              if (diskSizeField.value < imageSizeGiB) {
                diskSizeField.onChange(diskSizeNearest10(imageSizeGiB))
              }
            }}
          />
        )}

        {diskSource.type === 'snapshot' && <SnapshotSelectField control={control} />}
      </div>
    </>
  )
}

const DiskNameFromId = ({ disk }: { disk: string }) => {
  const { data, isPending, isError } = useQuery(
    q(api.diskView, { path: { disk } }, { throwOnError: false })
  )

  if (isPending || isError) return null
  return <> from {data.name}</>
}

const SnapshotSelectField = ({ control }: { control: Control<DiskCreate> }) => {
  const { project } = useProjectSelector()
  const snapshotsQuery = useQuery(q(api.snapshotList, { query: { project } }))

  const snapshots = snapshotsQuery.data?.items || []
  const diskSizeField = useController({ control, name: 'size' }).field

  return (
    <ListboxField
      control={control}
      name="diskBackend.diskSource.snapshotId"
      label="Source snapshot"
      placeholder="Select a snapshot"
      items={snapshots.map((i) => {
        const formattedSize = filesize(i.size, { base: 2, output: 'object' })
        return {
          value: i.id,
          selectedLabel: `${i.name}`,
          label: (
            <>
              <div>{i.name}</div>
              <div className="text-secondary selected:text-accent-secondary">
                Created on {toLocaleDateString(i.timeCreated)}
                <DiskNameFromId disk={i.diskId} /> <Slash /> {formattedSize.value}{' '}
                {formattedSize.unit}
              </div>
            </>
          ),
        }
      })}
      isLoading={snapshotsQuery.isPending}
      required
      onChange={(id) => {
        const snapshot = snapshots.find((i) => i.id === id)! // if it's selected, it must be present
        const snapshotSizeGiB = snapshot.size / GiB
        if (diskSizeField.value < snapshotSizeGiB) {
          diskSizeField.onChange(diskSizeNearest10(snapshotSizeGiB))
        }
      }}
    />
  )
}
