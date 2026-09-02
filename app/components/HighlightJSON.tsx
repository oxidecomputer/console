/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// Lifted from the audit log page (PR #2860) so the alert views can share it.
// Once that lands, AuditLog.tsx should import from here instead of keeping its
// own copy.

import { memo } from 'react'
import { type JsonValue } from 'type-fest'

const Indent = ({ depth }: { depth: number }) => (
  <span className="inline-block" style={{ width: `${depth * 2}ch` }} />
)

const greenText = 'text-(--color-green-1000) light:text-(--color-green-600)'
const yellowText = 'text-(--color-yellow-1000) light:text-(--color-yellow-600)'

const Primitive = ({ value }: { value: JsonValue | Date }) => {
  if (value === null) return <span className={yellowText}>null</span>
  if (typeof value === 'string') return <span className={greenText}>{`"${value}"`}</span>
  if (value instanceof Date)
    return <span className={greenText}>{`"${value.toISOString()}"`}</span>
  if (typeof value === 'boolean' || typeof value === 'number') {
    return <span className={yellowText}>{String(value)}</span>
  }
  // objects/arrays are handled by HighlightJSON, never reach here
  return null
}

type Props = {
  // `unknown` rather than JsonValue because the values come from API payloads
  // typed `Record<string, unknown>` and the renderer switches on runtime type
  // anyway. Anything that isn't JSON-like renders nothing.
  json: unknown
  depth?: number
  /** Render on one line with no indentation, for a truncated preview */
  inline?: boolean
}

// memo is important to avoid re-renders if the value hasn't changed. value
// passed in must be referentially stable, which should generally be the case
// with API responses
export const HighlightJSON = memo(({ json, depth = 0, inline = false }: Props) => {
  if (json === undefined) return null

  if (
    json === null ||
    typeof json === 'boolean' ||
    typeof json === 'number' ||
    typeof json === 'string' ||
    // special case. the types don't currently reflect that this is possible.
    // dates have type object so you can't use typeof
    json instanceof Date
  ) {
    return <Primitive value={json} />
  }

  // in inline mode a space stands in for the newline + indent between entries
  const open = inline ? ' ' : '\n'
  const indent = (d: number) => (inline ? null : <Indent depth={d} />)

  if (Array.isArray(json)) {
    if (json.length === 0) return <span className="text-quaternary">[]</span>

    return (
      <>
        <span className="text-quaternary">[</span>
        {open}
        {json.map((item, index) => (
          <span key={index}>
            {indent(depth + 1)}
            <HighlightJSON json={item} depth={depth + 1} inline={inline} />
            {index < json.length - 1 && <span className="text-quaternary">,</span>}
            {open}
          </span>
        ))}
        {indent(depth)}
        <span className="text-quaternary">]</span>
      </>
    )
  }

  if (typeof json !== 'object') return null

  const entries = Object.entries(json)
  if (entries.length === 0) return <span className="text-quaternary">{'{}'}</span>

  return (
    <>
      <span className="text-quaternary">{'{'}</span>
      {open}
      {entries.map(([key, val], index) => (
        <span key={key}>
          {indent(depth + 1)}
          <span className="text-default">{key}</span>
          <span className="text-quaternary">: </span>
          <HighlightJSON json={val} depth={depth + 1} inline={inline} />
          {index < entries.length - 1 && <span className="text-quaternary">,</span>}
          {open}
        </span>
      ))}
      {indent(depth)}
      <span className="text-quaternary">{'}'}</span>
    </>
  )
})
