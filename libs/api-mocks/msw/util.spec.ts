/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { describe, expect, it } from 'vitest'

import { FLEET_ID } from '@oxide/api'

import { defaultSilo, users } from '..'
import { paginated, userHasRole } from './util'

describe('paginated', () => {
  it('should return the first page', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const page = paginated({}, items)
    expect(page.items).toEqual([{ id: 'a' }, { id: 'b' }, { id: 'c' }])
    expect(page.nextPage).toBeNull()
  })

  it('should return the first 10 items with no limit passed', () => {
    const items = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
      { id: 'f' },
      { id: 'g' },
      { id: 'h' },
      { id: 'i' },
      { id: 'j' },
      { id: 'k' },
    ]
    const page = paginated({}, items)
    expect(page.items.length).toBe(10)
    expect(page.items).toEqual(items.slice(0, 10))
    expect(page.nextPage).toBe('k')
  })

  it('should return page with null `nextPage` if items equal page', () => {
    const items = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
      { id: 'f' },
      { id: 'g' },
      { id: 'h' },
      { id: 'i' },
      { id: 'j' },
    ]
    const page = paginated({}, items)
    expect(page.items.length).toBe(10)
    expect(page.items).toEqual(items.slice(0, 10))
    expect(page.nextPage).toBeNull()
  })

  it('should return 5 items with a limit of 5', () => {
    const items = [
      { id: 'a' },
      { id: 'b' },
      { id: 'c' },
      { id: 'd' },
      { id: 'e' },
      { id: 'f' },
    ]
    const page = paginated({ limit: 5 }, items)
    expect(page.items.length).toBe(5)
    expect(page.items).toEqual(items.slice(0, 5))
    expect(page.nextPage).toBe('f')
  })

  it('should return the second page when given a `page_token`', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    const page = paginated({ pageToken: 'b' }, items)
    expect(page.items.length).toBe(3)
    expect(page.items).toEqual([{ id: 'b' }, { id: 'c' }, { id: 'd' }])
    expect(page.nextPage).toBeNull()
  })
})

describe('userHasRole', () => {
  it('fleet viewer', () => {
    expect(
      users.map((u) => [u.display_name, userHasRole(u, 'fleet', FLEET_ID, 'viewer')])
    ).toEqual([
      ['Hannah Arendt', true],
      ['Hans Jonas', false],
      ['Jacob Klein', false],
      ['Simone de Beauvoir', false],
    ])
  })

  it('silo collaborator', () => {
    expect(
      users.map((u) => [
        u.display_name,
        userHasRole(u, 'silo', defaultSilo.id, 'collaborator'),
      ])
    ).toEqual([
      ['Hannah Arendt', true],
      ['Hans Jonas', true],
      ['Jacob Klein', false],
      ['Simone de Beauvoir', false],
    ])
  })
})
