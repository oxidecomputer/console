import { users } from '..'
import { paginated, userIsFleetViewer } from './util'

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

it('userIsFleetViewer', () => {
  expect(users.map((u) => [u.display_name, userIsFleetViewer(u)])).toEqual([
    ['Hannah Arendt', true],
    ['Hans Jonas', false],
    ['Jacob Klein', false],
    ['Simone de Beauvoir', false],
  ])
})
