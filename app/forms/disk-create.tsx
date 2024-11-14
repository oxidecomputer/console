/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { filesize } from 'filesize'
import { useMemo } from 'react'
import { useController, useForm, type Control } from 'react-hook-form'
import { useNavigate, type NavigateFunction } from 'react-router-dom'

import {
  useApiMutation,
  useApiQuery,
  useApiQueryClient,
  type BlockSize,
  type Disk,
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
import { FormDivider } from '~/ui/lib/Divider'
import { FieldLabel } from '~/ui/lib/FieldLabel'
import { Radio } from '~/ui/lib/Radio'
import { RadioGroup } from '~/ui/lib/RadioGroup'
import { Slash } from '~/ui/lib/Slash'
import { toLocaleDateString } from '~/util/date'
import { bytesToGiB, GiB } from '~/util/units'

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
  const navigate = useNavigate()

  const createDisk = useApiMutation('diskCreate', {
    onSuccess(data) {
      queryClient.invalidateQueries('diskList')
      addToast(<>Disk <HL>{data.name}</HL> created</>) // prettier-ignore
      onSuccess?.(data)
      onDismiss(navigate)
    },
  })

  const form = useForm({ defaultValues })
  const { project } = useProjectSelector()
  const projectImages = useApiQuery('imageList', { query: { project } })
  const siloImages = useApiQuery('imageList', {})

  // put project images first because if there are any, there probably aren't
  // very many and they're probably relevant
  const images = useMemo(
    () => [...(projectImages.data?.items || []), ...(siloImages.data?.items || [])],
    [projectImages.data, siloImages.data]
  )
  const areImagesLoading = projectImages.isPending || siloImages.isPending

  const snapshotsQuery = useApiQuery('snapshotList', { query: { project } })
  const snapshots = snapshotsQuery.data?.items || []

  // validate disk source size
  const diskSource = form.watch('diskSource').type

  let validateSizeGiB: number | undefined = undefined
  if (diskSource === 'snapshot') {
    const selectedSnapshotId = form.watch('diskSource.snapshotId')
    const selectedSnapshotSize = snapshots.find(
      (snapshot) => snapshot.id === selectedSnapshotId
    )?.size
    validateSizeGiB = selectedSnapshotSize ? bytesToGiB(selectedSnapshotSize) : undefined
  } else if (diskSource === 'image') {
    const selectedImageId = form.watch('diskSource.imageId')
    const selectedImageSize = images.find((image) => image.id === selectedImageId)?.size
    validateSizeGiB = selectedImageSize ? bytesToGiB(selectedImageSize) : undefined
  }

  return (
    <SideModalForm
      form={form}
      formType="create"
      resourceName="disk"
      onDismiss={() => onDismiss(navigate)}
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
      <NameField name="name" control={form.control} />
      <DescriptionField name="description" control={form.control} />
      <FormDivider />
      <DiskSourceField
        control={form.control}
        images={images}
        areImagesLoading={areImagesLoading}
      />
      <DiskSizeField
        name="size"
        control={form.control}
        validate={(diskSizeGiB: number) => {
          if (validateSizeGiB && diskSizeGiB < validateSizeGiB) {
            return `Must be as large as selected ${diskSource} (min. ${validateSizeGiB} GiB)`
          }
        }}
      />
    </SideModalForm>
  )
}

const DiskSourceField = ({
  control,
  images,
  areImagesLoading,
}: {
  control: Control<DiskCreate>
  images: Image[]
  areImagesLoading: boolean
}) => {
  const {
    field: { value, onChange },
  } = useController({ control, name: 'diskSource' })
  const diskSizeField = useController({ control, name: 'size' }).field

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
        {value.type === 'image' && (
          <ListboxField
            control={control}
            name="diskSource.imageId"
            label="Source image"
            placeholder="Select an image"
            isLoading={areImagesLoading}
            items={images.map((i) => toImageComboboxItem(i, true))}
            required
            onChange={(id) => {
              const image = images.find((i) => i.id === id)! // if it's selected, it must be present
              const imageSizeGiB = image.size / GiB
              if (diskSizeField.value < imageSizeGiB) {
                const nearest10 = Math.ceil(imageSizeGiB / 10) * 10
                diskSizeField.onChange(nearest10)
              }
            }}
          />
        )}

        {value.type === 'snapshot' && <SnapshotSelectField control={control} />}
      </div>
    </>
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
  const { project } = useProjectSelector()
  const snapshotsQuery = useApiQuery('snapshotList', { query: { project } })

  const snapshots = snapshotsQuery.data?.items || []
  const diskSizeField = useController({ control, name: 'size' }).field

  return (
    <ListboxField
      control={control}
      name="diskSource.snapshotId"
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
              <div className="text-tertiary selected:text-accent-secondary">
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
          const nearest10 = Math.ceil(snapshotSizeGiB / 10) * 10
          diskSizeField.onChange(nearest10)
        }
      }}
    />
  )
}
