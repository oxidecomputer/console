/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export type OxqlDiagnostic = {
  /** 1-based line in the query */
  line: number
  /** 1-based column in the line */
  column: number
  message: string
}

/**
 * Drop the caret line (whitespace + `^`) from a parse error: its alignment
 * assumes a monospace terminal, and the editor underline already points at
 * the position.
 */
export const stripCaretLine = (message: string) => message.replace(/\n *\^ *(?=\n|$)/, '')

/**
 * Split pattern for the code-ish parts of an error message: the query excerpt
 * between fmt_parse_error's `..` markers, peg's double-quoted expected tokens,
 * and the backtick- or double-quoted names in semantic errors. Used with
 * `String.split`, so the capture group puts code segments at odd indices.
 *
 * Quoted filter expressions can contain unescaped nested quotes (omicron
 * interpolates the raw expression, e.g. `The filter expression "kind ==
 * "power"" is not valid`), so that known frame gets a greedy context-anchored
 * alternative, and elsewhere a quote only closes a segment when followed by a
 * delimiter rather than a word char or another quote.
 * https://github.com/oxidecomputer/omicron/blob/6db4c7e/oximeter/db/src/oxql/plan/filter.rs
 */
export const codeSegment =
  /(\.\. [\s\S]*? \.\.|(?<=The filter expression )"[^\n]*"(?= is not valid)|(?<![\w"])"[^\n]*?"(?![\w"])|`[^`\n]*`)/

/**
 * Pull the position and expectation out of an OxQL parse error so it can be
 * shown as a diagnostic in the editor. The message format comes from
 * omicron's `fmt_parse_error`: an `Error at <line>:<column>` header and an
 * `Expected:` line whose peg Display redundantly repeats the position.
 * Returns null for errors that aren't parse errors (e.g., semantic ones).
 * https://github.com/oxidecomputer/omicron/blob/6db4c7e/oximeter/db/src/oxql/mod.rs
 */
export function parseOxqlQueryError(message: string): OxqlDiagnostic | null {
  const position = /^Error at (\d+):(\d+)/.exec(message)
  if (!position) return null
  const expected = /^Expected: (?:error at \d+:\d+: )?(.+)$/m.exec(message)?.[1]
  return {
    line: parseInt(position[1], 10),
    column: parseInt(position[2], 10),
    message: expected ? expected.trim() : message,
  }
}
