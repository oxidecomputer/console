/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Fragment } from 'react'

import { intersperse } from '~/util/array'
import { classed } from '~/util/classed'

import { getTimePropsForOxqlQuery, oxqlTimestamp, type OxqlQuery } from './util'

const Keyword = classed.span`text-[#C6A5EA]` // purple
const NewlinePipe = () => <span className="text-[#A7E0C8]">{'\n  | '}</span> // light green
const StringLit = classed.span`text-[#68D9A7]` // green
const NumLit = classed.span`text-[#EDD5A6]` // light yellow

const FilterSep = () => '\n      && '

export function HighlightedOxqlQuery({
  metricName,
  startTime,
  endTime,
  groupBy,
  eqFilters = {},
}: OxqlQuery) {
  const { meanWithinSeconds, adjustedStart } = getTimePropsForOxqlQuery(startTime, endTime)
  const filters = [
    <Fragment key="start">
      timestamp &gt;= <NumLit>@{oxqlTimestamp(adjustedStart)}</NumLit>
    </Fragment>,
    <Fragment key="end">
      timestamp &lt; <NumLit>@{oxqlTimestamp(endTime)}</NumLit>
    </Fragment>,
    ...Object.entries(eqFilters)
      .filter(([_, v]) => !!v)
      .map(([k, v]) => (
        <Fragment key={`${k}-${v}`}>
          {k} == <StringLit>&quot;{v}&quot;</StringLit>
        </Fragment>
      )),
  ]

  return (
    <>
      <Keyword>get</Keyword> {metricName}
      <NewlinePipe />
      <Keyword>filter</Keyword> {intersperse(filters, <FilterSep />)}
      <NewlinePipe />
      <Keyword>align</Keyword> mean_within(<NumLit>{meanWithinSeconds}s</NumLit>)
      {groupBy && (
        <>
          <NewlinePipe />
          <Keyword>group_by</Keyword> [{groupBy.cols.join(', ')}], {groupBy.op}
        </>
      )}
    </>
  )
}

export const toOxqlStr = ({
  metricName,
  startTime,
  endTime,
  groupBy,
  eqFilters = {},
}: OxqlQuery) => {
  const { meanWithinSeconds, adjustedStart } = getTimePropsForOxqlQuery(startTime, endTime)
  const filters = [
    `timestamp >= @${oxqlTimestamp(adjustedStart)}`,
    `timestamp < @${oxqlTimestamp(endTime)}`,
    ...Object.entries(eqFilters)
      // filter out key present but with falsy value. note that this will also
      // filter out empty string, meaning we can't filter by value = ""
      .filter(([_, v]) => !!v)
      .map(([k, v]) => `${k} == "${v}"`),
  ]

  const query = [
    `get ${metricName}`,
    `filter ${filters.join(' && ')}`,
    `align mean_within(${meanWithinSeconds}s)`,
  ]

  if (groupBy) query.push(`group_by [${groupBy.cols.join(', ')}], ${groupBy.op}`)
  return query.join(' | ')
}
