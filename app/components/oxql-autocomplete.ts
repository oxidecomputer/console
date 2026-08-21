/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  autocompletion,
  closeBrackets,
  closeBracketsKeymap,
  snippetCompletion,
  type Completion,
  type CompletionContext,
  type CompletionResult,
} from '@codemirror/autocomplete'
import type { Extension } from '@codemirror/state'
import { keymap } from '@codemirror/view'

import type { TimeseriesSchema } from '@oxide/api'

// The OxQL language surface below comes from RFD 463
// https://rfd.shared.oxide.computer/rfd/463

const tableOps: Completion[] = [
  { label: 'get', info: 'Retrieve a table by its timeseries name' },
  { label: 'filter', info: 'Filter timeseries by field values or timestamps' },
  { label: 'align', info: "Temporally align a table's samples" },
  {
    label: 'group_by',
    info: 'Group timeseries by the listed fields, reducing along the rest',
  },
  { label: 'join', info: 'Natural inner join between two or more tables' },
  { label: 'first', info: 'Limit each timeseries to its first k samples' },
  { label: 'last', info: 'Limit each timeseries to its last k samples' },
]

const alignFns: Completion[] = [
  snippetCompletion('mean_within(${period})', {
    label: 'mean_within',
    info: 'Average samples within each period, e.g. mean_within(30s)',
  }),
]

const reducers: Completion[] = [
  { label: 'mean', info: 'Average the values in each group' },
  { label: 'sum', info: 'Sum the values in each group' },
]

// identifiers that are valid in filter expressions alongside field names
const filterExtras: Completion[] = [
  { label: 'timestamp', info: 'The timestamp of each sample' },
  { label: 'start_time', info: 'The start time of each cumulative sample' },
  { label: '@now()', info: 'The current time, e.g. timestamp > @now() - 1m' },
]

const fieldCompletions = (
  context: CompletionContext,
  schemas: TimeseriesSchema[]
): Completion[] => {
  // offer the fields of every timeseries the query `get`s, deduped by name
  // since subquery filters can apply across tables
  const doc = context.state.doc.toString()
  const named = new Set(Array.from(doc.matchAll(/\bget\s+([\w:]+)/g), (m) => m[1]))
  const seen = new Set<string>()
  const options: Completion[] = []
  for (const schema of schemas) {
    if (!named.has(schema.timeseriesName)) continue
    for (const field of schema.fieldSchema) {
      if (seen.has(field.name)) continue
      seen.add(field.name)
      options.push({ label: field.name, detail: field.fieldType, info: field.description })
    }
  }
  return options
}

const schemaCompletion = (s: TimeseriesSchema): Completion => ({
  label: s.timeseriesName,
  detail: s.units === 'none' ? s.datumType : `${s.datumType}, ${s.units}`,
  info: s.description.metric,
})

/**
 * Complete based on which clause the cursor is in, determined with regexes
 * rather than a real parser: OxQL clauses are short and always start with a
 * table operation, so "text since the last pipe" is nearly always enough.
 *
 * Exported for tests; use {@link oxqlAutocomplete} in the editor.
 */
export const oxqlCompletionSource =
  (getSchemas: () => TimeseriesSchema[]) =>
  (context: CompletionContext): CompletionResult | null => {
    // the token being completed: word chars plus ':' (timeseries names) and '@' (@now())
    const word = context.matchBefore(/[@\w:]*/)
    if (!word) return null

    const before = context.state
      .sliceDoc(0, context.pos)
      // blank out logical operators (preserving length) so `filter a == 1 || b`
      // reads as one filter clause when we split on pipes below
      .replaceAll('||', '  ')
    // clauses are delimited by pipes and, in subqueries, braces and semicolons
    const clauseStart =
      Math.max(before.lastIndexOf('|'), before.lastIndexOf('{'), before.lastIndexOf(';')) +
      1
    const clause = before.slice(clauseStart)

    const result = (options: Completion[]): CompletionResult | null =>
      options.length > 0 ? { from: word.from, options, validFor: /^[@\w:]*$/ } : null

    // after `get`, complete timeseries names from the schema list
    if (/^\s*get\s+[\w:]*$/.test(clause)) {
      return result(getSchemas().map(schemaCompletion))
    }

    if (/^\s*align\s+\w*$/.test(clause)) return result(alignFns)

    // inside group_by's bracket list → fields; after the list and a comma → reducers
    if (/^\s*group_by\s*\[[^\]]*$/.test(clause)) {
      return result(fieldCompletions(context, getSchemas()))
    }
    if (/^\s*group_by\s*\[[^\]]*\]\s*,\s*\w*$/.test(clause)) return result(reducers)

    // anywhere in a filter expression, offer fields and time identifiers
    if (/^\s*filter\b/.test(clause)) {
      return result([...fieldCompletions(context, getSchemas()), ...filterExtras])
    }

    // otherwise, if we're at the start of a clause, offer table operations
    if (/^\s*\w*$/.test(clause)) return result(tableOps)

    return null
  }

/**
 * OxQL completions plus bracket/quote auto-closing. `getSchemas` is called on
 * each completion request, so the schema list can arrive after editor mount.
 */
export const oxqlAutocomplete = (getSchemas: () => TimeseriesSchema[]): Extension => [
  autocompletion({ override: [oxqlCompletionSource(getSchemas)], icons: false }),
  closeBrackets(),
  keymap.of(closeBracketsKeymap),
]
