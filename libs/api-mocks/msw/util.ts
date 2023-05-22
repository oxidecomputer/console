import { subHours } from 'date-fns'

import type { DiskCreate } from '@oxide/api'
import type { Json } from '@oxide/gen/msw-handlers'
import { json } from '@oxide/gen/msw-handlers'
import { GiB } from '@oxide/util'

import { db } from './db'

export { json } from '@oxide/gen/msw-handlers'

interface PaginateOptions {
  limit?: number
  pageToken?: string
}
export interface ResultsPage<I extends { id: string }> {
  items: I[]
  nextPage: string | null
}

export const paginated = <P extends PaginateOptions, I extends { id: string }>(
  params: P,
  items: I[]
) => {
  const { limit = 10, pageToken } = params || {}
  let startIndex = pageToken ? items.findIndex((i) => i.id === pageToken) : 0
  startIndex = startIndex < 0 ? 0 : startIndex

  if (startIndex > items.length) {
    return {
      items: [],
      nextPage: null,
    }
  }

  if (limit + startIndex >= items.length) {
    return {
      items: items.slice(startIndex),
      nextPage: null,
    }
  }

  return {
    items: items.slice(startIndex, startIndex + limit),
    nextPage: `${items[startIndex + limit].id}`,
  }
}

// make a bunch of copies of an object with different names and IDs. useful for
// testing pagination
export const repeat = <T extends { id: string; name: string }>(obj: T, n: number): T[] =>
  new Array(n).fill(0).map((_, i) => ({ ...obj, id: obj.id + i, name: obj.name + i }))

export const clone = <T extends object>(obj: T): T =>
  typeof structuredClone !== 'undefined'
    ? structuredClone(obj)
    : JSON.parse(JSON.stringify(obj))

export function getStartAndEndTime(params: { startTime?: Date; endTime?: Date }) {
  // if no start time or end time, give the last 24 hours. in this case the
  // API will give all data available for the metric (paginated of course),
  // so essentially we're pretending the last 24 hours just happens to be
  // all the data. if we have an end time but no start time, same deal, pretend
  // 24 hours before the given end time is where it starts
  const now = new Date()
  const { endTime = now, startTime = subHours(endTime, 24) } = params

  return { startTime, endTime }
}

export function getTimestamps() {
  const now = new Date().toISOString()
  return { time_created: now, time_modified: now }
}

export const unavailableErr = json({ error_code: 'ServiceUnavailable' }, { status: 503 })

export const NotImplemented = () => {
  throw json({ error_code: 'NotImplemented' }, { status: 501 })
}

export const errIfExists = <T extends Record<string, unknown>>(
  collection: T[],
  match: Partial<{ [key in keyof T]: T[key] }>,
  resourceLabel = 'resource'
) => {
  if (
    collection.some((item) =>
      Object.entries(match).every(([key, value]) => item[key] === value)
    )
  ) {
    const name = 'name' in match ? match.name : 'id' in match ? match.id : '<resource>'
    throw json(
      {
        error_code: 'ObjectAlreadyExists',
        message: `already exists: ${resourceLabel} "${name}"`,
      },
      { status: 400 }
    )
  }
}

export const errIfInvalidDiskSize = (disk: Json<DiskCreate>) => {
  const source = disk.disk_source
  if (source.type === 'snapshot') {
    const snapshotSize = db.snapshots.find((s) => source.snapshot_id === s.id)?.size ?? 0
    if (disk.size >= snapshotSize) return
    throw 'Disk size must be greater than or equal to the snapshot size'
  }
  if (source.type === 'image') {
    const imageSize = db.images.find((i) => source.image_id === i.id)?.size ?? 0
    if (disk.size >= imageSize) return
    throw 'Disk size must be greater than or equal to the image size'
  }
  if (source.type === 'blank') {
    if (disk.size >= 1 * GiB) return
    // TODO: this is a bit arbitrary, should match whatever the API does
    throw 'Minimum disk size is 1 GiB'
  }
}
