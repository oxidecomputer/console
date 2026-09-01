/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it, test } from 'vitest'

import {
  diskCan,
  genName,
  instanceCan,
  parsePortRange,
  resendableAlertIds,
  subscriptionRegex,
  synthesizeData,
} from './util'

describe('subscriptionRegex', () => {
  it('matches exact class names', () => {
    expect(subscriptionRegex('instance.create').test('instance.create')).toBe(true)
    expect(subscriptionRegex('instance.create').test('instance.created')).toBe(false)
  })

  it('* matches exactly one segment', () => {
    const re = subscriptionRegex('disk.*')
    expect(re.test('disk.create')).toBe(true)
    expect(re.test('disk.snapshot.create')).toBe(false)
    expect(re.test('disk')).toBe(false)
  })

  it('* can appear in any position', () => {
    const re = subscriptionRegex('*.create')
    expect(re.test('disk.create')).toBe(true)
    expect(re.test('instance.create')).toBe(true)
    expect(re.test('instance.ephemeral_ip.create')).toBe(false)
  })

  it('** matches one or more segments', () => {
    const re = subscriptionRegex('hardware.**')
    expect(re.test('hardware.power_shelf.psu.insert')).toBe(true)
    expect(re.test('hardware.psu')).toBe(true)
    expect(re.test('hardware')).toBe(false)

    const suffix = subscriptionRegex('**.delete')
    expect(suffix.test('project.delete')).toBe(true)
    expect(suffix.test('instance.ephemeral_ip.delete')).toBe(true)
    expect(suffix.test('delete')).toBe(false)
  })

  it('does not match substrings within a segment', () => {
    expect(subscriptionRegex('instance.**').test('silo.instance_quota.hit')).toBe(false)
    expect(subscriptionRegex('disk.*').test('bigdisk.create')).toBe(false)
  })
})

describe('parsePortRange', () => {
  describe('parses', () => {
    it('single ports up to 5 digits', () => {
      expect(parsePortRange('0')).toEqual([0, 0])
      expect(parsePortRange('1')).toEqual([1, 1])
      expect(parsePortRange('123')).toEqual([123, 123])
      expect(parsePortRange('12356')).toEqual([12356, 12356])
    })

    it('ranges', () => {
      expect(parsePortRange('123-456')).toEqual([123, 456])
      expect(parsePortRange('1-45690')).toEqual([1, 45690])
      expect(parsePortRange('5-5')).toEqual([5, 5])
    })

    it('with surrounding whitespace', () => {
      expect(parsePortRange('123-456 ')).toEqual([123, 456])
      expect(parsePortRange('  1-45690')).toEqual([1, 45690])
      expect(parsePortRange('  5-5  \n')).toEqual([5, 5])
    })
  })

  describe('rejects', () => {
    it('nonsense', () => {
      expect(parsePortRange('12a5')).toEqual(null)
      expect(parsePortRange('lkajsdfha')).toEqual(null)
    })

    it('p2 < p1', () => {
      expect(parsePortRange('123-45')).toEqual(null)
    })

    it('too many digits', () => {
      expect(parsePortRange('239032')).toEqual(null)
    })
  })
})

test('genName', () => {
  expect(genName('a'.repeat(64), 'b'.repeat(64))).toMatch(/^a{27}-b{27}-[0-9a-f]{6}$/)
  expect(genName('a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64))).toMatch(
    /^a{18}-b{18}-c{18}-[0-9a-f]{6}$/
  )

  // Test a bunch of lengths to make sure we don't overflow the max length
  for (let i = 2; i <= 128; i = 2 * i) {
    const singlePartName = genName('a'.repeat(i))
    expect(singlePartName.length).toBeLessThanOrEqual(63)
    expect(singlePartName).toMatch(/^a+-[0-9a-f]{6}$/)

    const doublePartName = genName('a'.repeat(i / 2), 'b'.repeat(i / 2))
    expect(doublePartName.length).toBeLessThanOrEqual(63)
    expect(doublePartName).toMatch(/^a+-b+-[0-9a-f]{6}$/)
  }
})

const pt = (timestamp: Date, value: number) => ({
  timestamp,
  datum: { datum: value, type: 'i64' as const },
})

describe('synthesizeData', () => {
  const start = new Date(2023, 3, 2)
  const mid1 = new Date(2023, 3, 3)
  const mid2 = new Date(2023, 3, 4)
  const end = new Date(2023, 3, 5)

  it('returns undefined when either input list is undefined', () => {
    expect(synthesizeData(undefined, undefined, start, end, (x) => x)).toEqual(undefined)
    expect(synthesizeData([], undefined, start, end, (x) => x)).toEqual(undefined)
    expect(synthesizeData(undefined, [], start, end, (x) => x)).toEqual(undefined)
  })

  it('adds 0s at start and end when there is no data', () => {
    expect(synthesizeData([], [], start, end, (x) => x)).toEqual([
      { timestamp: start.getTime(), value: 0 },
      { timestamp: end.getTime(), value: 0 },
    ])
  })

  it("adds start and end when there's data in range", () => {
    const result = synthesizeData(
      [pt(mid1, 4), pt(mid2, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 3 },
      { timestamp: mid1.getTime(), value: 4 },
      { timestamp: mid2.getTime(), value: 5 },
      { timestamp: end.getTime(), value: 5 },
    ])
  })

  it('valueTransform is applied to both data in range and synthetic start and end', () => {
    const result = synthesizeData(
      [pt(mid1, 4), pt(mid2, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => 2 * x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 6 },
      { timestamp: mid1.getTime(), value: 8 },
      { timestamp: mid2.getTime(), value: 10 },
      { timestamp: end.getTime(), value: 10 },
    ])
  })

  it('does not add synthentic start when existing data point matches start time exactly', () => {
    const result = synthesizeData(
      [pt(start, 4), pt(mid1, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 4 },
      { timestamp: mid1.getTime(), value: 5 },
      { timestamp: end.getTime(), value: 5 },
    ])
  })
})

test('instanceCan', () => {
  expect(instanceCan.start({ runState: 'running' })).toBe(false)
  expect(instanceCan.start({ runState: 'stopped' })).toBe(true)

  // @ts-expect-error typechecker rejects actions that don't exist
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  instanceCan.abc
})

test('diskCan', () => {
  expect(diskCan.delete({ state: { state: 'creating' } })).toBe(false)
  expect(diskCan.delete({ state: { state: 'attached', instance: 'xyz' } })).toBe(false)
  expect(diskCan.delete({ state: { state: 'detached' } })).toBe(true)

  // snapshot requires distributed, non-read-only disk type
  expect(
    diskCan.snapshot({
      state: { state: 'detached' },
      diskType: 'distributed',
      readOnly: false,
    })
  ).toBe(true)
  expect(
    diskCan.snapshot({
      state: { state: 'attached', instance: 'x' },
      diskType: 'distributed',
      readOnly: false,
    })
  ).toBe(true)
  expect(
    diskCan.snapshot({
      state: { state: 'creating' },
      diskType: 'distributed',
      readOnly: false,
    })
  ).toBe(false)
  expect(
    diskCan.snapshot({ state: { state: 'detached' }, diskType: 'local', readOnly: false })
  ).toBe(false)
  expect(
    diskCan.snapshot({
      state: { state: 'attached', instance: 'x' },
      diskType: 'local',
      readOnly: false,
    })
  ).toBe(false)

  // read-only disks cannot be snapshotted
  expect(
    diskCan.snapshot({
      state: { state: 'detached' },
      diskType: 'distributed',
      readOnly: true,
    })
  ).toBe(false)

  // @ts-expect-error typechecker rejects actions that don't exist
  // eslint-disable-next-line @typescript-eslint/no-unused-expressions
  diskCan.abc
})

describe('resendableAlertIds', () => {
  // the rule only reads these four fields, so build them directly
  type Delivery = Parameters<typeof resendableAlertIds>[0][number]

  const d = (
    alertId: string,
    state: Delivery['state'],
    trigger: Delivery['trigger'],
    alertClass = 'hardware.sled.fault'
  ): Delivery => ({ alertId, state, trigger, alertClass })

  const ids = (deliveries: Delivery[]) => [...resendableAlertIds(deliveries)].sort()

  it('is empty when there are no deliveries', () => {
    expect(ids([])).toEqual([])
  })

  it('includes an alert whose only delivery failed', () => {
    expect(ids([d('a', 'failed', 'alert')])).toEqual(['a'])
  })

  it('excludes delivered and pending alerts', () => {
    expect(ids([d('a', 'delivered', 'alert'), d('b', 'pending', 'alert')])).toEqual([])
  })

  // the bug this rule replaced: it counted failed delivery records, so an
  // alert that had already been resent successfully was requeued forever
  it('excludes an alert that has a failed record but also a successful resend', () => {
    const deliveries = [d('a', 'failed', 'alert'), d('a', 'delivered', 'resend')]
    expect(ids(deliveries)).toEqual([])
  })

  // a resend in flight takes the alert out of the set, so a second probe does
  // not double-queue it
  it('excludes an alert with a resend still pending', () => {
    const deliveries = [d('a', 'failed', 'alert'), d('a', 'pending', 'resend')]
    expect(ids(deliveries)).toEqual([])
  })

  it('counts an alert once no matter how many times it failed', () => {
    const deliveries = [d('a', 'failed', 'alert'), d('a', 'failed', 'resend')]
    expect(ids(deliveries)).toEqual(['a'])
  })

  it('ignores probe deliveries entirely', () => {
    const deliveries = [
      d('probe-alert', 'delivered', 'probe', 'probe'),
      d('probe-alert', 'failed', 'probe', 'probe'),
      d('a', 'failed', 'alert'),
    ]
    expect(ids(deliveries)).toEqual(['a'])
  })

  // a successful probe of an alert does not mean the alert itself landed, so it
  // must not settle the alert. matches omicron's triggered_by != probe filter
  it('does not let a probe-triggered success settle a real alert', () => {
    const deliveries = [d('a', 'failed', 'alert'), d('a', 'delivered', 'probe')]
    expect(ids(deliveries)).toEqual(['a'])
  })

  it('handles several alerts at once', () => {
    const deliveries = [
      d('w', 'failed', 'alert'),
      d('x', 'delivered', 'alert'),
      d('y', 'failed', 'alert'),
      d('y', 'failed', 'resend'),
      d('z', 'failed', 'alert'),
      d('z', 'pending', 'resend'),
    ]
    expect(ids(deliveries)).toEqual(['w', 'y'])
  })
})
