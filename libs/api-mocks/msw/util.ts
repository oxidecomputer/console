import { differenceInSeconds, subHours } from 'date-fns'
import type { RestRequest } from 'msw'

import type {
  DiskCreate,
  Sled,
  SystemMetricName,
  SystemMetricQueryParams,
  User,
} from '@oxide/api'
import { totalCapacity } from '@oxide/api'
import type { Json } from '@oxide/gen/msw-handlers'
import { json } from '@oxide/gen/msw-handlers'
import { GiB, TiB, isTruthy } from '@oxide/util'

import { genI64Data } from '../metrics'
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

class Rando {
  private a: number
  private c: number
  private m: number
  private seed: number

  constructor(seed: number, a = 1664525, c = 1013904223, m = 2 ** 32) {
    this.seed = seed
    this.a = a
    this.c = c
    this.m = m
  }

  public next(): number {
    this.seed = (this.a * this.seed + this.c) % this.m
    return this.seed / this.m
  }
}

export function generateUtilization(
  metricName: SystemMetricName,
  startTime: Date,
  endTime: Date,
  sleds: Json<Sled>[]
) {
  // generate data from at most 90 days ago no matter how early start time is
  const adjStartTime = new Date(
    Math.max(startTime.getTime(), Date.now() - 1000 * 60 * 60 * 24 * 90)
  )

  const capacity = totalCapacity(
    sleds.map((s) => ({
      usableHardwareThreads: s.usable_hardware_threads,
      usablePhysicalRam: s.usable_physical_ram,
    }))
  )
  const cap =
    metricName === 'cpus_provisioned'
      ? capacity.cpu
      : metricName === 'virtual_disk_space_provisioned'
      ? capacity.disk_tib * TiB
      : capacity.ram_gib * GiB
  const metricNameSeed = Array.from(metricName).reduce(
    (acc, char) => acc + char.charCodeAt(0),
    0
  )

  const rando = new Rando(adjStartTime.getTime() + metricNameSeed)
  const diff = Math.abs(differenceInSeconds(adjStartTime, endTime))

  // How many quarter hour chunks in the date range
  // Use that as how often to offset the data to seem
  // more realistic
  const timeInterval = diff / 900

  // If the data is the following length
  const dataCount = 1000
  // How far along the array should we do something
  const valueInterval = Math.floor(dataCount / timeInterval)

  // Pick a reasonable start value
  const startVal = cap / 2
  const values = new Array<number>(dataCount)
  values[0] = startVal

  let x = 0
  for (let i = 1; i < values.length; i++) {
    values[i] = values[i - 1]

    if (x === valueInterval) {
      // Do something 3/4 of the time
      let offset = 0
      const random = rando.next()

      const threshold = i < 250 || (i > 500 && i < 750) ? 1 : 0.375

      if (random < threshold) {
        const amount =
          metricName === 'cpus_provisioned'
            ? 3
            : metricName === 'virtual_disk_space_provisioned'
            ? TiB
            : TiB / 20
        offset = Math.floor(random * amount)

        if (random < threshold / 3) {
          offset = offset * -1
        }
      }

      if (random > 0.72) {
        values[i] += offset
      } else {
        values[i] = Math.max(values[i] - offset, 0)
      }
      x = 0
    } else {
      x++
    }
  }

  return values
}

type MetricParams = {
  path: { metricName: SystemMetricName }
  query: Omit<SystemMetricQueryParams, 'silo'>
}

export function handleMetrics({ path: { metricName }, query }: MetricParams) {
  const { startTime, endTime } = getStartAndEndTime(query)

  if (endTime <= startTime) return { items: [] }

  const dataPoints = generateUtilization(metricName, startTime, endTime, db.sleds)

  // Important to remember (but probably not important enough to change) that
  // this works quite differently from the real API, which is going to be
  // querying clickhouse with some fixed set of data, and when it starts from
  // the end (order == 'descending') it's going to get data points starting
  // from the end. When it starts from the beginning it gets data points from
  // the beginning. For our fake data, we just generate the same set of data
  // points spanning the whole time range, then reverse the list if necessary
  // and take the first N=limit data points.

  let items = genI64Data(dataPoints, startTime, endTime)

  if (query.order === 'descending') {
    items.reverse()
  }

  if (typeof query.limit === 'number') {
    items = items.slice(0, query.limit)
  }

  return { items }
}

export function currentUser(req: RestRequest): Json<User> {
  const name = req.cookies['msw-user']
  return db.users.find((u) => u.display_name === name) ?? db.users[0]
}

export function requireFleetViewer(req: RestRequest) {
  const user = currentUser(req)
  const userGroupIds = db.groupMemberships
    .filter((gm) => gm.userId === user.id)
    .map((gm) => db.userGroups.find((g) => g.id === gm.groupId))
    .filter(isTruthy)
    .map((g) => g.id)

  // don't need to filter by role because any role is at least viewer
  const actorsWithFleetRole = db.roleAssignments
    .filter((ra) => ra.resource_type === 'fleet')
    .map((ra) => ra.identity_id)

  // user is a fleet viewer if their own ID or any of their groups is
  // associated with any fleet role
  const isFleetViewer = [user.id, ...userGroupIds].some((id) =>
    actorsWithFleetRole.includes(id)
  )

  if (!isFleetViewer) throw 403 // should it 404? I think the API is a mix
}
