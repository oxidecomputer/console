/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CompletionContext, type CompletionResult } from '@codemirror/autocomplete'
import { EditorState } from '@codemirror/state'
import { expect, it } from 'vitest'

import type { TimeseriesSchema } from '@oxide/api'

import { oxqlCompletionSource } from './oxql-autocomplete'

const schemas: TimeseriesSchema[] = [
  {
    authzScope: 'fleet',
    created: new Date(0),
    datumType: 'f32',
    description: { target: 'A hardware component', metric: 'A fan speed measurement' },
    fieldSchema: [
      {
        name: 'chassis_kind',
        fieldType: 'string',
        source: 'target',
        description: 'What kind of thing the component is a part of',
      },
      {
        name: 'sled_id',
        fieldType: 'uuid',
        source: 'target',
        description: 'ID of the sled',
      },
    ],
    timeseriesName: 'hardware_component:fan_speed',
    units: 'rpm',
    version: 1,
  },
  {
    authzScope: 'fleet',
    created: new Date(0),
    datumType: 'cumulative_u64',
    description: { target: 'A sled data link', metric: 'Bytes sent on the link' },
    fieldSchema: [
      {
        name: 'sled_id',
        fieldType: 'uuid',
        source: 'target',
        description: 'ID of the sled',
      },
      {
        name: 'link_name',
        fieldType: 'string',
        source: 'target',
        description: 'Name of the link',
      },
    ],
    timeseriesName: 'sled_data_link:bytes_sent',
    units: 'bytes',
    version: 1,
  },
]

/** Run the completion source on `doc` with the cursor at the end */
const complete = (doc: string): CompletionResult | null =>
  oxqlCompletionSource(() => schemas)(
    new CompletionContext(EditorState.create({ doc }), doc.length, false)
  )

const labels = (doc: string) => complete(doc)?.options.map((o) => o.label)

it('completes table operations at the start of a clause', () => {
  expect(labels('g')).toContain('get')
  expect(labels('get hardware_component:fan_speed | f')).toContain('filter')
  // after a pipe and a space, all ops are offered with an empty prefix
  expect(labels('get hardware_component:fan_speed | ')).toContain('group_by')
})

it('completes timeseries names after get', () => {
  expect(labels('get ')).toEqual([
    'hardware_component:fan_speed',
    'sled_data_link:bytes_sent',
  ])
  expect(labels('get hardware_com')).toEqual([
    'hardware_component:fan_speed',
    'sled_data_link:bytes_sent',
  ])
  // from points at the start of the name so CM's own prefix filtering applies
  const result = complete('get hardware_com')
  expect(result?.from).toBe('get '.length)
})

it('completes fields of the queried timeseries in filter', () => {
  const result = labels('get hardware_component:fan_speed | filter ch')
  expect(result).toContain('chassis_kind')
  expect(result).toContain('sled_id')
  expect(result).toContain('timestamp')
  // @now() is a literal, not an identifier, so it's not offered here
  expect(result).not.toContain('@now()')
  // fields of timeseries the query doesn't get are not offered
  expect(result).not.toContain('link_name')
})

it('dedupes fields across multiple gets in a subquery', () => {
  const doc =
    '{ get hardware_component:fan_speed; get sled_data_link:bytes_sent } | filter '
  const result = labels(doc)
  expect(result).toContain('link_name')
  expect(result?.filter((l) => l === 'sled_id')).toHaveLength(1)
})

it('still completes filter fields after a logical operator', () => {
  const doc = "get hardware_component:fan_speed | filter chassis_kind == 'power' || sl"
  expect(labels(doc)).toContain('sled_id')
})

it('completes fields inside group_by brackets and reducers after them', () => {
  expect(labels('get hardware_component:fan_speed | group_by [sl')).toContain('sled_id')
  expect(labels('get hardware_component:fan_speed | group_by [sled_id], ')).toEqual([
    'mean',
    'sum',
  ])
})

it('offers only literals at literal positions, not fields', () => {
  const literals = ['@now()', 'true', 'false']
  expect(labels('get hardware_component:fan_speed | filter chassis_kind == ')).toEqual(
    literals
  )
  expect(labels('get hardware_component:fan_speed | filter timestamp > @no')).toEqual(
    literals
  )
})

it('offers only get at the start of a query branch', () => {
  expect(labels('')).toEqual(['get'])
  expect(labels('g')).toEqual(['get'])
  expect(labels('{ get hardware_component:fan_speed; ')).toEqual(['get'])
})

it('does not offer get after a pipe', () => {
  const result = labels('get hardware_component:fan_speed | ')
  expect(result).not.toContain('get')
  expect(result).toContain('filter')
})

it('offers nothing at positions expecting an operator', () => {
  const filter = 'get hardware_component:fan_speed | filter '
  // after a complete literal of any kind, quoted or not, spaced or not
  expect(complete(`${filter}timestamp > @now()`)).toBeNull()
  expect(complete(`${filter}chassis_kind == 'power' `)).toBeNull()
  expect(complete(`${filter}sled_id == 5 `)).toBeNull()
  // duration arithmetic after @now()
  expect(complete(`${filter}timestamp > @now() - `)).toBeNull()
  // after an identifier, where a comparison operator is expected
  expect(complete(`${filter}sled_id `)).toBeNull()
  // after a closing paren
  expect(complete(`${filter}(sled_id == 5) `)).toBeNull()
})

it('offers fields at the start of each boolean operand', () => {
  const filter = 'get hardware_component:fan_speed | filter '
  expect(labels(`${filter}chassis_kind == 'power' && `)).toContain('sled_id')
  expect(labels(`${filter}chassis_kind == 'power' ^ `)).toContain('sled_id')
  expect(labels(`${filter}(`)).toContain('sled_id')
  expect(labels(`${filter}!`)).toContain('sled_id')
})

it('ignores a get inside a string literal', () => {
  const doc =
    "get hardware_component:fan_speed | filter chassis_kind == 'get sled_data_link:bytes_sent' && "
  const result = labels(doc)
  expect(result).toContain('chassis_kind')
  expect(result).not.toContain('link_name')
})

it('offers nothing after a complete quoted literal', () => {
  expect(
    complete("get hardware_component:fan_speed | filter chassis_kind == 'power'")
  ).toBeNull()
})

it('offers nothing inside a string literal', () => {
  expect(
    complete("get hardware_component:fan_speed | filter chassis_kind == 'pow")
  ).toBeNull()
})

it('ignores pipes and semicolons inside strings when finding the clause', () => {
  const doc = "get hardware_component:fan_speed | filter chassis_kind == 'a | b; c' || sl"
  expect(labels(doc)).toContain('sled_id')
})

it('scopes fields to the innermost subquery branch', () => {
  const doc =
    '{ get hardware_component:fan_speed; get sled_data_link:bytes_sent | filter li'
  const result = labels(doc)
  expect(result).toContain('link_name')
  expect(result).not.toContain('chassis_kind')
})

it('offers datum alongside fields in filter', () => {
  expect(labels('get hardware_component:fan_speed | filter ')).toContain('datum')
})

it('completes alignment functions after align', () => {
  expect(labels('get hardware_component:fan_speed | align m')).toEqual(['mean_within'])
})

it('offers nothing after a complete get clause', () => {
  expect(complete('get hardware_component:fan_speed ')).toBeNull()
})
