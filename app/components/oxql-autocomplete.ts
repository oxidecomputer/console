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

// every query/subquery starts with `get`, and `get` cannot appear again after
// a pipe, so it is offered separately from the other table operations
const getOp: Completion = { label: 'get', info: 'Retrieve a table by its timeseries name' }

const pipeOps: Completion[] = [
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

const atNow: Completion = {
  label: '@now()',
  info: 'The current time, e.g. timestamp > @now() - 1m',
}

// completable literals for the right-hand side of a filter comparison
const literals: Completion[] = [atNow, { label: 'true' }, { label: 'false' }]

// identifiers that are valid in filter expressions alongside field names
const filterExtras: Completion[] = [
  { label: 'timestamp', info: 'The timestamp of each sample' },
  { label: 'start_time', info: 'The start time of each cumulative sample' },
  { label: 'datum', info: 'The value of each sample' },
]

/**
 * Walk the document up to `pos`, skipping string literals, to find (1) whether
 * the cursor is inside an unterminated string, (2) where the current clause
 * starts (last `|`/`{`/`;`/`}` outside strings, with `||` ignored), and
 * (3) where the innermost query branch containing the cursor starts: a `{`
 * opens a subquery, `;` starts a sibling branch, and `}` returns to the
 * enclosing query's scope.
 */
const scanQuery = (doc: string, pos: number) => {
  let quote: string | null = null
  let escaped = false
  let clauseStart = 0
  let scopeStart = 0
  const enclosingScopes: number[] = []
  for (let i = 0; i < pos; i++) {
    const c = doc[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (quote) {
      if (c === '\\') escaped = true
      else if (c === quote) quote = null
      continue
    }
    switch (c) {
      case "'":
      case '"':
        quote = c
        break
      case '|':
        // logical || is not a clause boundary
        if (doc[i + 1] === '|') i++
        else clauseStart = i + 1
        break
      case '{':
        enclosingScopes.push(scopeStart)
        scopeStart = i + 1
        clauseStart = i + 1
        break
      case ';':
        scopeStart = i + 1
        clauseStart = i + 1
        break
      case '}':
        scopeStart = enclosingScopes.pop() ?? 0
        clauseStart = i + 1
        break
    }
  }
  return { inString: quote !== null, clauseStart, scopeStart }
}

const fieldCompletions = (
  context: CompletionContext,
  scopeStart: number,
  schemas: TimeseriesSchema[]
): Completion[] => {
  // offer the fields of every timeseries the innermost query branch `get`s,
  // deduped by name since subquery filters can apply across tables. Blank out
  // string literals so quoted text can't contribute a phantom `get`
  const scope = context.state
    .sliceDoc(scopeStart, context.pos)
    .replace(/'[^']*'|"[^"]*"/g, '')
  const named = new Set(Array.from(scope.matchAll(/\bget\s+([\w:]+)/g), (m) => m[1]))
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

    const doc = context.state.doc.toString()
    const { inString, clauseStart, scopeStart } = scanQuery(doc, context.pos)

    // no completions inside a string literal
    if (inString) return null

    const clause = doc.slice(clauseStart, context.pos)

    const result = (options: Completion[]): CompletionResult | null =>
      options.length > 0 ? { from: word.from, options, validFor: /^[@\w:]*$/ } : null

    // after `get`, complete timeseries names from the schema list
    if (/^\s*get\s+[\w:]*$/.test(clause)) {
      return result(getSchemas().map(schemaCompletion))
    }

    if (/^\s*align\s+\w*$/.test(clause)) return result(alignFns)

    // inside group_by's bracket list → fields; after the list and a comma → reducers
    if (/^\s*group_by\s*\[[^\]]*$/.test(clause)) {
      return result(fieldCompletions(context, scopeStart, getSchemas()))
    }
    if (/^\s*group_by\s*\[[^\]]*\]\s*,\s*\w*$/.test(clause)) return result(reducers)

    if (/^\s*filter\b/.test(clause)) {
      // comparisons are strictly `ident op literal`, so each cursor position
      // allows exactly one kind of completion. Right after a comparison
      // operator, only literals are legal
      if (/(?:==|!=|>=|<=|<|>|~=)\s*[@\w:]*$/.test(clause)) return result(literals)
      // identifiers are legal only at the start of a boolean operand: after
      // `filter` itself, a logical operator, an open paren, or negation
      if (/(?:\bfilter|&&|\|\||\^|\(|!)\s*[@\w:]*$/.test(clause)) {
        return result([
          ...fieldCompletions(context, scopeStart, getSchemas()),
          ...filterExtras,
        ])
      }
      // any other position (after a complete literal or identifier, closing
      // paren, etc.) expects an operator, which we don't complete
      return null
    }

    // otherwise, at the start of a clause, offer `get` if this is the first
    // clause of a query branch and the other table operations after a pipe.
    // Known quirk: right after `}` only a pipe is legal, but we offer ops
    // anyway — distinguishing that case means tracking boundary kind in the
    // scanner, more state than this heuristic approach warrants
    if (/^\s*\w*$/.test(clause)) {
      return result(clauseStart === scopeStart ? [getOp] : pipeOps)
    }

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
