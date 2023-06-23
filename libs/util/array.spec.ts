import { groupBy, lowestBy, sortBy, sumBy } from './array'

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

test('lowestBy', () => {
  expect(lowestBy([{ x: 'd' }, { x: 'b' }, { x: 'c' }, { x: 'a' }], (o) => o.x)).toEqual({
    x: 'a',
  })

  expect(
    lowestBy(
      [{ x: [0, 0, 0, 0] }, { x: [0, 0, 0] }, { x: [0] }, { x: [0, 0] }],
      (o) => o.x.length
    )
  ).toEqual({ x: [0] })
})

test('groupBy', () => {
  expect(
    groupBy(
      [
        { x: 'a', y: 1 },
        { x: 'b', y: 2 },
        { x: 'a', y: 3 },
      ],
      (o) => o.x
    )
  ).toEqual([
    [
      'a',
      [
        { x: 'a', y: 1 },
        { x: 'a', y: 3 },
      ],
    ],
    ['b', [{ x: 'b', y: 2 }]],
  ])
})

test('sumBy', () => {
  expect(sumBy([], (x) => x)).toEqual(0)
  expect(sumBy([{ a: 1 }, { a: 2 }], (x) => x.a)).toEqual(3)
})
