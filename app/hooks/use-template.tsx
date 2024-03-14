/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useEffect } from 'react'
import { type FieldValues, type Path, type UseFormSetValue } from 'react-hook-form'
import { useSearchParams } from 'react-router-dom'

import { genName, useApiQuery, type BlockSize } from '@oxide/api'
import { bytesToGiB } from '@oxide/util'

import type { DiskTableItem } from 'app/components/form'
import {
  baseDefaultValues as instanceDefaultValues,
  type InstanceCreateInput,
} from 'app/forms/instance-create'

function incrementName(str: string) {
  let name = str
  const match = name.match(/(.*)-(\d+)$/)

  if (match) {
    const base = match[1]
    const num = parseInt(match[2], 10)
    name = `${base}-${num + 1}`
  } else {
    name = `${name}-1`
  }

  return name
}

export function useInstanceTemplate(setValue: UseFormSetValue<InstanceCreateInput>) {
  const [searchParams, setSearchParams] = useSearchParams()
  const instanceId = searchParams.get('template') || ''

  const { data: instance, isFetched: instanceFetched } = useApiQuery(
    'instanceView',
    {
      path: { instance: instanceId },
    },
    { enabled: !!instanceId }
  )

  const { data: disksData, isFetched: disksFetched } = useApiQuery(
    'instanceDiskList',
    {
      path: { instance: instanceId },
    },
    { enabled: !!instanceId }
  )

  useEffect(() => {
    if (!instanceFetched || !disksFetched || !instance) return

    const disks = disksData?.items || []
    const bootDisk = disks.length > 0 ? disks[0] : null

    const additionalDisks: DiskTableItem[] = disks.slice(1).map((disk) => ({
      description: disk.description,
      diskSource: {
        type: 'blank',
        blockSize: disk.blockSize as BlockSize,
      },
      name: disk.name,
      size: disk.size,
      type: 'create',
    }))

    const template: InstanceCreateInput = {
      name: incrementName(instance.name),
      description: instanceDefaultValues.description,
      presetId: 'custom',
      memory: bytesToGiB(instance.memory),
      ncpus: instance.ncpus,
      hostname: instance.hostname,

      bootDiskName: bootDisk ? genName(bootDisk.name) : instanceDefaultValues.bootDiskName,
      bootDiskSize: bootDisk?.size
        ? bytesToGiB(bootDisk?.size)
        : instanceDefaultValues.bootDiskSize,
      image: bootDisk?.imageId || '',

      disks: additionalDisks,
      networkInterfaces: { type: 'default' },

      start: instanceDefaultValues.start,

      userData: instanceDefaultValues.userData,
    }

    setTemplateFormValues(setValue, template)

    searchParams.delete('template')
    setSearchParams(searchParams)
  }, [
    instance,
    instanceFetched,
    disksFetched,
    disksData,
    setValue,
    setSearchParams,
    searchParams,
  ])
}

export function setTemplateFormValues<TFieldValues extends FieldValues>(
  setValue: UseFormSetValue<TFieldValues>,
  values: TFieldValues
) {
  Object.keys(values).forEach((key) => {
    if (values[key]) {
      setValue(key as Path<TFieldValues>, values[key])
    }
  })
}
