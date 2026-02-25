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
    expect(page.next_page).toBeNull()
  })

  it('defaults to name_ascending for items with a name field', () => {
    const items = [
      { id: 'z', name: 'zebra' },
      { id: 'a', name: 'antelope' },
      { id: 'm', name: 'moose' },
    ]
    const page = paginated({}, items)
    expect(page.items.map((i) => i.name)).toEqual(['antelope', 'moose', 'zebra'])
    expect(page.next_page).toBeNull()
  })

  it('should return the first 100 items with no limit passed', () => {
    const items = Array.from({ length: 200 }).map((_, i) => ({ id: 'i' + i }))
    const page = paginated({}, items)
    expect(page.items.length).toBe(100)
    expect(page.next_page).toBeTruthy()
  })

  it('should return page with null `next_page` if items equal page', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String.fromCharCode(97 + i),
    }))
    const page = paginated({}, items)
    expect(page.items.length).toBe(10)
    expect(page.next_page).toBeNull()
  })

  it('should return 5 items with a limit of 5', () => {
    const items = Array.from({ length: 6 }, (_, i) => ({
      id: String.fromCharCode(97 + i),
    }))
    const page = paginated({ limit: 5 }, items)
    expect(page.items.length).toBe(5)
    expect(page.next_page).toBe('e')
  })

  it('should return the second page when given a page_token', () => {
    const items = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }]
    const page = paginated({ pageToken: 'a' }, items)
    expect(page.items).toEqual([{ id: 'b' }, { id: 'c' }, { id: 'd' }])
    expect(page.next_page).toBeNull()
  })

  it('returns empty page for limit 0', () => {
    const page = paginated({ limit: 0 }, [{ id: 'a' }])
    expect(page.items).toEqual([])
    expect(page.next_page).toBeNull()
  })

  it('pages through with no overlap and no gap', () => {
    const items = Array.from({ length: 10 }, (_, i) => ({
      id: String.fromCharCode(97 + i),
    }))
    const p1 = paginated({ limit: 3 }, items)
    expect(p1.items.map((i) => i.id)).toEqual(['a', 'b', 'c'])

    const p2 = paginated({ limit: 3, pageToken: p1.next_page }, items)
    expect(p2.items.map((i) => i.id)).toEqual(['d', 'e', 'f'])

    const p3 = paginated({ limit: 3, pageToken: p2.next_page }, items)
    expect(p3.items.map((i) => i.id)).toEqual(['g', 'h', 'i'])

    const p4 = paginated({ limit: 3, pageToken: p3.next_page }, items)
    expect(p4.items.map((i) => i.id)).toEqual(['j'])
    expect(p4.next_page).toBeNull()
  })

  it('sorts name_descending with id ascending as tiebreaker', () => {
    const items = [
      { id: 'z', name: 'beta' },
      { id: 'a', name: 'alpha' },
      { id: 'b', name: 'alpha' },
    ]
    const page = paginated({ sortBy: 'name_descending' }, items)
    expect(page.items.map((i) => i.id)).toEqual(['z', 'a', 'b'])
  })

  it('pages through name_descending', () => {
    const items = [
      { id: 'd', name: 'zest' },
      { id: 'c', name: 'yak' },
      { id: 'b', name: 'xerox' },
      { id: 'a', name: 'walrus' },
    ]
    const p1 = paginated({ sortBy: 'name_descending', limit: 2 }, items)
    expect(p1.items.map((i) => i.name)).toEqual(['zest', 'yak'])

    const p2 = paginated(
      { sortBy: 'name_descending', limit: 2, pageToken: p1.next_page },
      items
    )
    expect(p2.items.map((i) => i.name)).toEqual(['xerox', 'walrus'])
    expect(p2.next_page).toBeNull()
  })

  it('sorts time_and_id_ascending', () => {
    const t1 = '2024-01-01T00:00:00.000Z'
    const t2 = '2024-02-01T00:00:00.000Z'
    const items = [
      { id: 'b', time_created: t2 },
      { id: 'c', time_created: t1 },
      { id: 'a', time_created: t1 },
    ]
    const page = paginated({ sortBy: 'time_and_id_ascending' }, items)
    expect(page.items.map((i) => i.id)).toEqual(['a', 'c', 'b'])
  })

  it('pages through time_and_id_ascending', () => {
    const t1 = '2024-01-01T00:00:00.000Z'
    const t2 = '2024-02-01T00:00:00.000Z'
    const items = [
      { id: 'b', time_created: t2 },
      { id: 'c', time_created: t1 },
      { id: 'a', time_created: t1 },
    ]
    const p1 = paginated({ sortBy: 'time_and_id_ascending', limit: 2 }, items)
    expect(p1.items.map((i) => i.id)).toEqual(['a', 'c'])

    const p2 = paginated(
      { sortBy: 'time_and_id_ascending', limit: 2, pageToken: p1.next_page },
      items
    )
    expect(p2.items.map((i) => i.id)).toEqual(['b'])
    expect(p2.next_page).toBeNull()
  })

  it('pages through time_and_id_descending', () => {
    const t1 = '2024-01-01T00:00:00.000Z'
    const t2 = '2024-02-01T00:00:00.000Z'
    const items = [
      { id: 'b', time_created: t2 },
      { id: 'c', time_created: t1 },
      { id: 'a', time_created: t1 },
    ]
    // Both columns descending: t2 first, then t1 items by id descending (c > a)
    const p1 = paginated({ sortBy: 'time_and_id_descending', limit: 2 }, items)
    expect(p1.items.map((i) => i.id)).toEqual(['b', 'c'])

    const p2 = paginated(
      { sortBy: 'time_and_id_descending', limit: 2, pageToken: p1.next_page },
      items
    )
    expect(p2.items.map((i) => i.id)).toEqual(['a'])
    expect(p2.next_page).toBeNull()
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
      ['Jane Austen', true],
      ['Herbert Marcuse', false],
      ['Aryeh Kosman', false],
      ['Elizabeth Anscombe', false],
      ['Theodor Adorno', false],
      ['Antonio Gramsci', false],
    ])
  })

  it('fleet admin', () => {
    expect(
      users.map((u) => [u.display_name, userHasRole(u, 'fleet', FLEET_ID, 'admin')])
    ).toEqual([
      ['Hannah Arendt', true],
      ['Hans Jonas', false],
      ['Jacob Klein', false],
      ['Simone de Beauvoir', false],
      ['Jane Austen', false],
      ['Herbert Marcuse', false],
      ['Aryeh Kosman', false],
      ['Elizabeth Anscombe', false],
      ['Theodor Adorno', false],
      ['Antonio Gramsci', false],
    ])
  })

  it('silo viewer', () => {
    expect(
      users.map((u) => [u.display_name, userHasRole(u, 'silo', defaultSilo.id, 'viewer')])
    ).toEqual([
      ['Hannah Arendt', true],
      ['Hans Jonas', true],
      ['Jacob Klein', false],
      ['Simone de Beauvoir', false],
      ['Jane Austen', true],
      ['Herbert Marcuse', false],
      ['Aryeh Kosman', false],
      ['Elizabeth Anscombe', false],
      ['Theodor Adorno', false],
      ['Antonio Gramsci', false],
    ])
  })

  it('silo limited_collaborator', () => {
    expect(
      users.map((u) => [
        u.display_name,
        userHasRole(u, 'silo', defaultSilo.id, 'limited_collaborator'),
      ])
    ).toEqual([
      ['Hannah Arendt', true],
      ['Hans Jonas', true],
      ['Jacob Klein', false],
      ['Simone de Beauvoir', false],
      ['Jane Austen', true],
      ['Herbert Marcuse', false],
      ['Aryeh Kosman', false],
      ['Elizabeth Anscombe', false],
      ['Theodor Adorno', false],
      ['Antonio Gramsci', false],
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
      ['Jane Austen', true],
      ['Herbert Marcuse', false],
      ['Aryeh Kosman', false],
      ['Elizabeth Anscombe', false],
      ['Theodor Adorno', false],
      ['Antonio Gramsci', false],
    ])
  })

  it('silo admin', () => {
    expect(
      users.map((u) => [u.display_name, userHasRole(u, 'silo', defaultSilo.id, 'admin')])
    ).toEqual([
      ['Hannah Arendt', true],
      ['Hans Jonas', false],
      ['Jacob Klein', false],
      ['Simone de Beauvoir', false],
      ['Jane Austen', false],
      ['Herbert Marcuse', false],
      ['Aryeh Kosman', false],
      ['Elizabeth Anscombe', false],
      ['Theodor Adorno', false],
      ['Antonio Gramsci', false],
    ])
  })
})
