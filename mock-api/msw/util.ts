/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { differenceInSeconds, subHours } from 'date-fns'
// Works without the .js for dev server and prod build in MSW mode, but
// playwright wants the .js. No idea why, let's just add the .js.
import { IPv4, IPv6 } from 'ip-num/IPNumber.js'
import { match } from 'ts-pattern'

import {
  FLEET_ID,
  MAX_DISK_SIZE_GiB,
  MIN_DISK_SIZE_GiB,
  totalCapacity,
  type DiskBackend,
  type DiskCreate,
  type IpRange,
  type OxqlQueryResult,
  type RoleKey,
  type Sled,
  type SystemMetricName,
  type SystemMetricQueryParams,
  type TimeseriesQuery,
  type User,
} from '@oxide/api'

import { json, type Json } from '~/api/__generated__/msw-handlers'
import type { OxqlNetworkMetricName, OxqlVcpuState } from '~/components/oxql-metrics/util'
import { parseIp } from '~/util/ip'
import { GiB, TiB } from '~/util/units'

import type { DbRoleAssignmentResourceType } from '..'
import { genI64Data } from '../metrics'
import { getMockOxqlInstanceData } from '../oxql-metrics'
import { db, lookupById } from './db'
import { Rando } from './rando'

type SortMode =
  | 'name_ascending'
  | 'name_descending'
  | 'id_ascending'
  | 'time_and_id_ascending'
  | 'time_and_id_descending'

interface PaginateOptions {
  limit?: number | null
  pageToken?: string | null
  sortBy?: SortMode
}

export interface ResultsPage<I extends { id: string }> {
  items: I[]
  next_page: string | null
}

/**
 * Sort items based on the sort mode. Implements default sorting behavior to
 * match Omicron's pagination defaults.
 * https://github.com/oxidecomputer/omicron/blob/cf38148/common/src/api/external/http_pagination.rs#L427-L428
 * https://github.com/oxidecomputer/omicron/blob/cf38148/common/src/api/external/http_pagination.rs#L334-L335
 * https://github.com/oxidecomputer/omicron/blob/cf38148/common/src/api/external/http_pagination.rs#L511-L512
 */
function sortItems<I extends { id: string }>(items: I[], sortBy: SortMode): I[] {
  const sorted = [...items]

  switch (sortBy) {
    case 'name_ascending':
      return sorted.sort((a, b) => {
        // Use byte-wise lexicographic comparison to match Rust's String ordering,
        // not locale-aware localeCompare()
        const aName = 'name' in a ? String(a.name) : a.id
        const bName = 'name' in b ? String(b.name) : b.id
        return aName < bName ? -1 : aName > bName ? 1 : 0
      })
    case 'name_descending':
      return sorted.sort((a, b) => {
        const aName = 'name' in a ? String(a.name) : a.id
        const bName = 'name' in b ? String(b.name) : b.id
        return bName < aName ? -1 : bName > aName ? 1 : 0
      })
    case 'id_ascending':
      // Use pure lexicographic comparison for UUIDs to match Rust's derived Ord
      // and avoid locale-dependent behavior
      return sorted.sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    case 'time_and_id_ascending':
      return sorted.sort((a, b) => {
        // Compare timestamps numerically to handle Date objects and non-ISO formats
        // Normalize NaN from invalid dates to -Infinity for deterministic ordering
        const aRaw =
          'time_created' in a
            ? new Date(a.time_created as string | Date).valueOf()
            : -Infinity
        const bRaw =
          'time_created' in b
            ? new Date(b.time_created as string | Date).valueOf()
            : -Infinity
        const aTime = Number.isFinite(aRaw) ? aRaw : -Infinity
        const bTime = Number.isFinite(bRaw) ? bRaw : -Infinity
        const timeCompare = aTime - bTime
        return timeCompare !== 0 ? timeCompare : a.id < b.id ? -1 : a.id > b.id ? 1 : 0
      })
    case 'time_and_id_descending':
      return sorted.sort((a, b) => {
        // Compare timestamps numerically to handle Date objects and non-ISO formats
        // Normalize NaN from invalid dates to -Infinity for deterministic ordering
        const aRaw =
          'time_created' in a
            ? new Date(a.time_created as string | Date).valueOf()
            : -Infinity
        const bRaw =
          'time_created' in b
            ? new Date(b.time_created as string | Date).valueOf()
            : -Infinity
        const aTime = Number.isFinite(aRaw) ? aRaw : -Infinity
        const bTime = Number.isFinite(bRaw) ? bRaw : -Infinity
        const timeCompare = bTime - aTime
        return timeCompare !== 0 ? timeCompare : b.id < a.id ? -1 : b.id > a.id ? 1 : 0
      })
  }
}

/**
 * Get the page token value for an item based on the sort mode.
 * Matches Omicron's marker types for each scan mode.
 */
function getPageToken<I extends { id: string }>(item: I, sortBy: SortMode): string {
  switch (sortBy) {
    case 'name_ascending':
    case 'name_descending':
      // ScanByNameOrId uses Name as marker for name-based sorting
      return 'name' in item ? String(item.name) : item.id
    case 'id_ascending':
      // ScanById uses Uuid as marker
      return item.id
    case 'time_and_id_ascending':
    case 'time_and_id_descending':
      // ScanByTimeAndId uses (DateTime, Uuid) tuple as marker
      // Serialize as "timestamp|id" (using | since timestamps contain :)
      const time = 'time_created' in item ? String(item.time_created) : ''
      return `${time}|${item.id}`
  }
}

/**
 * Find the start index for pagination based on the page token and sort mode.
 * Handles different marker types matching Omicron's pagination behavior.
 */
function findStartIndex<I extends { id: string }>(
  sortedItems: I[],
  pageToken: string,
  sortBy: SortMode
): number {
  switch (sortBy) {
    case 'name_ascending':
    case 'name_descending':
      // Page token is a name - find first item with this name
      return sortedItems.findIndex((i) =>
        'name' in i ? i.name === pageToken : i.id === pageToken
      )
    case 'id_ascending':
      // Page token is an ID
      return sortedItems.findIndex((i) => i.id === pageToken)
    case 'time_and_id_ascending':
    case 'time_and_id_descending':
      // Page token is "timestamp|id" - find item with matching timestamp and ID
      const [time, id] = pageToken.split('|', 2)
      return sortedItems.findIndex(
        (i) =>
          i.id === id && ('time_created' in i ? String(i.time_created) === time : false)
      )
  }
}

export const paginated = <P extends PaginateOptions, I extends { id: string }>(
  params: P,
  items: I[]
) => {
  const limit = params.limit || 100
  const pageToken = params.pageToken

  // Apply default sorting based on what fields are available, matching Omicron's defaults:
  // - name_ascending for endpoints that support name/id sorting (most common)
  // - id_ascending for endpoints that only support id sorting
  // Note: time_and_id_ascending is only used when explicitly specified in sortBy
  const sortBy =
    params.sortBy ||
    (items.length > 0 && 'name' in items[0] ? 'name_ascending' : 'id_ascending')

  const sortedItems = sortItems(items, sortBy)

  let startIndex = pageToken ? findStartIndex(sortedItems, pageToken, sortBy) : 0

  // Warn if page token not found - helps catch bugs in tests
  if (pageToken && startIndex < 0) {
    console.warn(`Page token "${pageToken}" not found, starting from beginning`)
    startIndex = 0
  }

  if (startIndex > sortedItems.length) {
    return {
      items: [],
      next_page: null,
    }
  }

  if (limit + startIndex >= sortedItems.length) {
    return {
      items: sortedItems.slice(startIndex),
      next_page: null,
    }
  }

  return {
    items: sortedItems.slice(startIndex, startIndex + limit),
    next_page: getPageToken(sortedItems[startIndex + limit], sortBy),
  }
}

// make a bunch of copies of an object with different names and IDs. useful for
// testing pagination
export const repeat = <T extends { id: string; name: string }>(obj: T, n: number): T[] =>
  Array.from({ length: n }).map((_, i) => ({ ...obj, id: obj.id + i, name: obj.name + i }))

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

export const forbiddenErr = () =>
  json({ error_code: 'Forbidden', request_id: 'fake-id' }, { status: 403 })

export const unavailableErr = () =>
  json({ error_code: 'ServiceUnavailable', request_id: 'fake-id' }, { status: 503 })

export const NotImplemented = () => {
  // This doesn't just return the response because it broadens the type to be usable
  // directly as a handler
  throw json({ error_code: 'NotImplemented' }, { status: 501 })
}

export const internalError = (message: string) =>
  json({ error_code: 'InternalError', message }, { status: 500 })

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
    const name =
      'name' in match && match.name
        ? match.name
        : 'id' in match && match.id
          ? match.id
          : '<resource>'
    throw json(
      {
        error_code: 'ObjectAlreadyExists',
        message: `already exists: ${resourceLabel} "${name.toString()}"`,
      },
      { status: 400 }
    )
  }
}

/**
 * Get block size for a disk based on its backend type.
 * https://github.com/oxidecomputer/omicron/blob/dd74446/nexus/src/app/sagas/disk_create.rs#L292-L304
 * https://github.com/oxidecomputer/omicron/blob/dd74446/nexus/src/app/disk.rs#L159-L174
 */
export function getBlockSize(backend: Json<DiskBackend>): number {
  return match(backend)
    .with({ type: 'local' }, () => 4096) // All local disks use 4k block size (AdvancedFormat)
    .with({ type: 'distributed' }, ({ disk_source: source }) =>
      match(source)
        .with({ type: 'blank' }, (s) => s.block_size)
        .with({ type: 'importing_blocks' }, (s) => s.block_size)
        .with({ type: 'snapshot' }, (s) => {
          // Look up the snapshot's source disk to get block_size (throws 404 if not found)
          const snapshot = lookupById(db.snapshots, s.snapshot_id)
          return lookupById(db.disks, snapshot.disk_id).block_size
        })
        .with({ type: 'image' }, (s) => lookupById(db.images, s.image_id).block_size)
        .exhaustive()
    )
    .exhaustive()
}

export const errIfInvalidDiskSize = (disk: Json<DiskCreate>) => {
  if (disk.size < MIN_DISK_SIZE_GiB * GiB) {
    throw `Disk size must be greater than or equal to ${MIN_DISK_SIZE_GiB} GiB`
  }
  if (disk.size > MAX_DISK_SIZE_GiB * GiB) {
    throw `Disk size must be less than or equal to ${MAX_DISK_SIZE_GiB} GiB`
  }
  // Local disks have no source to validate against. Distributed disks from
  // image or snapshot must be at least as large as the source.
  match(disk.disk_backend)
    .with({ type: 'local' }, () => {})
    .with({ type: 'distributed', disk_source: { type: 'blank' } }, () => {})
    .with({ type: 'distributed', disk_source: { type: 'importing_blocks' } }, () => {})
    .with(
      { type: 'distributed', disk_source: { type: 'snapshot' } },
      ({ disk_source: s }) => {
        const snapshot = lookupById(db.snapshots, s.snapshot_id)
        if (disk.size < snapshot.size) {
          throw 'Disk size must be greater than or equal to the snapshot size'
        }
      }
    )
    .with({ type: 'distributed', disk_source: { type: 'image' } }, ({ disk_source: s }) => {
      const image = lookupById(db.images, s.image_id)
      if (disk.size < image.size) {
        throw 'Disk size must be greater than or equal to the image size'
      }
    })
    .exhaustive()
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
  const startVal = 500
  const values = Array.from<number>({ length: dataCount })
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
        const amount = 50
        offset = Math.floor(random * amount)

        if (random < threshold / 2.5) {
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

  // Find the current maximum value in the generated data
  const currentMax = Math.max(...values)

  // Normalize the data to sit within the range of 0 to overall capacity
  const randomFactor = Math.random() * (1 - 0.33) + 0.33
  const normalizedValues = values.map((value) => {
    let v = (value / currentMax) * cap * randomFactor
    if (metricName === 'cpus_provisioned') {
      // CPU utilization should be whole numbers
      v = Math.floor(v)
    }
    return v
  })

  return normalizedValues
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

export const MSW_USER_COOKIE = 'msw-user'

/**
 * Look up user by display name in cookie. Return the first user if cookie empty
 * or name not found. We're using display name to make it easier to set the
 * cookie by hand, because there is no way yet to pick a user through the UI.
 *
 * If cookie is empty or name is not found, return the first user in the list,
 * who has admin on everything.
 */
export function currentUser(cookies: Record<string, string>): Json<User> {
  const name = cookies[MSW_USER_COOKIE]
  return db.users.find((u) => u.display_name === name) ?? db.users[0]
}

/**
 * Given a role A, get a list of the roles (including A) that confer *at least*
 * the powers of A.
 */
// could implement with `takeUntil(allRoles, r => r === role)`, but that is so
// much harder to understand
const roleOrStronger: Record<RoleKey, RoleKey[]> = {
  viewer: ['viewer', 'limited_collaborator', 'collaborator', 'admin'],
  limited_collaborator: ['limited_collaborator', 'collaborator', 'admin'],
  collaborator: ['collaborator', 'admin'],
  admin: ['admin'],
}

/**
 * Determine whether a user has a role at least as strong as `role` on the
 * specified resource. Implements parent-child inheritance like Nexus does:
 * if a user has a role on a silo, they inherit that role on all projects
 * in the silo.
 */
export function userHasRole(
  user: Json<User>,
  resourceType: DbRoleAssignmentResourceType,
  resourceId: string,
  role: RoleKey
): boolean {
  const userGroupIds = db.groupMemberships
    .filter((gm) => gm.userId === user.id)
    .map((gm) => db.userGroups.find((g) => g.id === gm.groupId))
    .filter((g) => !!g)
    .map((g) => g.id)

  const actorIds = [user.id, ...userGroupIds]

  /** All actors with *at least* the specified role on the resource */
  const actorsWithRole = db.roleAssignments
    .filter(
      (ra) =>
        ra.resource_type === resourceType &&
        ra.resource_id === resourceId &&
        roleOrStronger[role].includes(ra.role_name)
    )
    .map((ra) => ra.identity_id)

  // Direct role on the resource
  if (actorIds.some((id) => actorsWithRole.includes(id))) {
    return true
  }

  // Check for inherited roles: if checking project role, also check parent silo roles
  // Silo role inheritance to project roles:
  // - silo admin → project admin
  // - silo collaborator → project admin (note collaborator → admin)
  // - silo limited_collaborator → project limited_collaborator
  // - silo viewer → project viewer
  if (resourceType === 'project') {
    const project = db.projects.find((p) => p.id === resourceId)
    if (!project) return false

    // Map requested project role to silo roles that confer authority
    const siloRolesForProjectRole: Record<RoleKey, RoleKey[]> = {
      admin: ['admin', 'collaborator'], // silo collaborator grants project admin
      collaborator: ['admin', 'collaborator'],
      limited_collaborator: ['admin', 'collaborator', 'limited_collaborator'],
      viewer: ['admin', 'collaborator', 'limited_collaborator', 'viewer'],
    }

    const requiredSiloRoles = siloRolesForProjectRole[role] || []

    // Check if user has any silo role that grants the requested project role
    const siloActorsWithRole = db.roleAssignments
      .filter(
        (ra) =>
          ra.resource_type === 'silo' &&
          ra.resource_id === user.silo_id &&
          requiredSiloRoles.includes(ra.role_name)
      )
      .map((ra) => ra.identity_id)

    if (actorIds.some((id) => siloActorsWithRole.includes(id))) {
      return true
    }
  }

  return false
}

/**
 * Determine whether current user has fleet viewer permissions by looking for
 * fleet roles for the user as well as for the user's groups. Do nothing if yes,
 * throw 403 if no.
 */
export function requireFleetViewer(cookies: Record<string, string>) {
  requireRole(cookies, 'fleet', FLEET_ID, 'viewer')
}

export function requireFleetCollab(cookies: Record<string, string>) {
  requireRole(cookies, 'fleet', FLEET_ID, 'collaborator')
}

export function requireFleetAdmin(cookies: Record<string, string>) {
  requireRole(cookies, 'fleet', FLEET_ID, 'admin')
}

/**
 * Determine whether current user has fleet admin OR silo admin on a specific
 * silo. Used for SCIM token operations. Do nothing if yes, throw 403 if no.
 */
export function requireFleetAdminOrSiloAdmin(
  cookies: Record<string, string>,
  siloId: string
) {
  const user = currentUser(cookies)
  const hasFleetAdmin = userHasRole(user, 'fleet', FLEET_ID, 'admin')
  const hasSiloAdmin = userHasRole(user, 'silo', siloId, 'admin')
  if (!hasFleetAdmin && !hasSiloAdmin) throw forbiddenErr()
}

/**
 * Determine whether current user has a role on a resource by looking roles
 * for the user as well as for the user's groups. Do nothing if yes, throw 403
 * if no.
 */
export function requireRole(
  cookies: Record<string, string>,
  resourceType: DbRoleAssignmentResourceType,
  resourceId: string,
  role: RoleKey
) {
  const user = currentUser(cookies)
  // should it 404? I think the API is a mix
  if (!userHasRole(user, resourceType, resourceId, role)) throw forbiddenErr()
}

const ipToBigInt = (ip: string): bigint =>
  parseIp(ip).type === 'v4' ? new IPv4(ip).value : new IPv6(ip).value

export const ipRangeLen = ({ first, last }: IpRange) =>
  ipToBigInt(last) - ipToBigInt(first) + 1n

function ipInRange(ip: string, { first, last }: IpRange): boolean {
  const ipIsV4 = parseIp(ip).type === 'v4'
  const rangeIsV4 = parseIp(first).type === 'v4'

  // if they're not the same version then definitely false
  if (ipIsV4 !== rangeIsV4) return false

  // since they're the same version we can do a version-agnostic comparison
  const ipNum = ipToBigInt(ip)
  return ipToBigInt(first) <= ipNum && ipNum <= ipToBigInt(last)
}

export const ipInAnyRange = (ip: string, ranges: IpRange[]) =>
  ranges.some((range) => ipInRange(ip, range))

export function updateDesc(
  resource: { description: string },
  update: { description?: string | null }
) {
  // Can't be `if (update.description)` because you could never set it to ''
  if (update.description != null) {
    resource.description = update.description
  }
}

// The metric name is the second word in the query string
const getMetricNameFromQuery = (query: string) => query.split(' ')[1]

// The state value is the string in quotes after 'state == ' in the query string
// It might not be present in the string
const getCpuStateFromQuery = (query: string): OxqlVcpuState | undefined => {
  const stateRegex = /state\s*==\s*"([^"]+)"/
  const match = query.match(stateRegex)
  return match ? (match[1] as OxqlVcpuState) : undefined
}

export function handleOxqlMetrics({ query }: TimeseriesQuery): Json<OxqlQueryResult> {
  const metricName = getMetricNameFromQuery(query) as OxqlNetworkMetricName
  const stateValue = getCpuStateFromQuery(query)
  return getMockOxqlInstanceData(metricName, stateValue)
}

export function randomHex(length: number) {
  const hexChars = '0123456789abcdef'
  return Array.from({ length })
    .map(() => hexChars.charAt(Math.floor(Math.random() * hexChars.length)))
    .join('')
}
