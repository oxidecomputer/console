import { sortBy } from './array'

test('sortBy', () => {
  expect(sortBy(['d', 'b', 'c', 'a'])).toEqual(['a', 'b', 'c', 'd'])

  expect(sortBy([{ x: 'd' }, { x: 'b' }, { x: 'c' }, { x: 'a' }], (o) => o.x)).toEqual([
    { x: 'a' },
    { x: 'b' },
    { x: 'c' },
    { x: 'd' },
  ])

  expect(
    sortBy(
      [{ x: [0, 0, 0, 0] }, { x: [0, 0, 0] }, { x: [0] }, { x: [0, 0] }],
      (o) => o.x.length
    )
  ).toEqual([{ x: [0] }, { x: [0, 0] }, { x: [0, 0, 0] }, { x: [0, 0, 0, 0] }])
})
