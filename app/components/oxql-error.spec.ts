/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { parseOxqlQueryError, stripCaretLine } from './oxql-error'

// realistic examples of omicron's fmt_parse_error output
const parseError = `Error at 1:1: .. junk junk junk! ..
                 ^
Expected: error at 1:1: expected one of "get", "{"
`

const multilineError = `Error at 2:5: .. :bytes_sent
 | oops ..
        ^
Expected: error at 2:5: expected one of "align", "filter"
`

describe('parseOxqlQueryError', () => {
  it('extracts position and the expected clause', () => {
    expect(parseOxqlQueryError(parseError)).toEqual({
      line: 1,
      column: 1,
      message: 'expected one of "get", "{"',
    })
  })

  it('handles positions past line 1', () => {
    expect(parseOxqlQueryError(multilineError)).toEqual({
      line: 2,
      column: 5,
      message: 'expected one of "align", "filter"',
    })
  })

  it('falls back to the whole message when the Expected line is missing', () => {
    const result = parseOxqlQueryError('Error at 3:7: something odd')
    expect(result).toEqual({
      line: 3,
      column: 7,
      message: 'Error at 3:7: something odd',
    })
  })

  it('returns null for non-parse errors', () => {
    expect(parseOxqlQueryError('Input tables to a `group_by` must be aligned')).toBeNull()
    expect(parseOxqlQueryError('Internal Server Error')).toBeNull()
  })
})

describe('stripCaretLine', () => {
  it('removes the caret line, leaving header and Expected intact', () => {
    expect(stripCaretLine(parseError)).toEqual(
      `Error at 1:1: .. junk junk junk! ..
Expected: error at 1:1: expected one of "get", "{"
`
    )
  })

  it('handles trailing spaces after the caret', () => {
    expect(stripCaretLine('Error at 1:5: .. x ..\n     ^   \nExpected: y\n')).toEqual(
      'Error at 1:5: .. x ..\nExpected: y\n'
    )
  })

  it('leaves messages without a caret line alone', () => {
    const semantic = 'Input tables to a `group_by` must be aligned'
    expect(stripCaretLine(semantic)).toEqual(semantic)
    // a ^ used inside the query context is not a caret line
    const withCaretChar = 'Error at 1:9: .. filter a ^ b ..\nExpected: y\n'
    expect(stripCaretLine(withCaretChar)).toEqual(withCaretChar)
  })
})
