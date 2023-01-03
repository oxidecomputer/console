import { genName, listToTree, parsePortRange } from './util'

describe('parsePortRange', () => {
  describe('parses', () => {
    it('single ports up to 5 digits', () => {
      expect(parsePortRange('0')).toEqual([0, 0])
      expect(parsePortRange('1')).toEqual([1, 1])
      expect(parsePortRange('123')).toEqual([123, 123])
      expect(parsePortRange('12356')).toEqual([12356, 12356])
    })

    it('ranges', () => {
      expect(parsePortRange('123-456')).toEqual([123, 456])
      expect(parsePortRange('1-45690')).toEqual([1, 45690])
      expect(parsePortRange('5-5')).toEqual([5, 5])
    })
  })

  describe('rejects', () => {
    it('nonsense', () => {
      expect(parsePortRange('12a5')).toEqual(null)
      expect(parsePortRange('lkajsdfha')).toEqual(null)
    })

    it('p2 < p1', () => {
      expect(parsePortRange('123-45')).toEqual(null)
    })

    it('too many digits', () => {
      expect(parsePortRange('239032')).toEqual(null)
    })
  })
})

test('genName', () => {
  expect(genName('a'.repeat(64), 'b'.repeat(64))).toMatch(/^a{27}-b{27}-[0-9a-f]{6}$/)
  expect(genName('a'.repeat(64), 'b'.repeat(64), 'c'.repeat(64))).toMatch(
    /^a{18}-b{18}-c{18}-[0-9a-f]{6}$/
  )

  // Test a bunch of lengths to make sure we don't overflow the max length
  for (let i = 2; i <= 128; i = 2 * i) {
    const singlePartName = genName('a'.repeat(i))
    expect(singlePartName.length).toBeLessThanOrEqual(63)
    expect(singlePartName).toMatch(/^a+-[0-9a-f]{6}$/)

    const doublePartName = genName('a'.repeat(i / 2), 'b'.repeat(i / 2))
    expect(doublePartName.length).toBeLessThanOrEqual(63)
    expect(doublePartName).toMatch(/^a+-b+-[0-9a-f]{6}$/)
  }
})

const nodeA = { id: 'a' }
const nodeB = { id: 'b', parentId: 'a' }
const nodeC = { id: 'c', parentId: 'a' }
const nodeD = { id: 'd', parentId: 'b' }

test('listToTree', () => {
  expect(listToTree([])).toEqual([])
  expect(listToTree([nodeA, nodeB, nodeC, nodeD])).toEqual([
    {
      ...nodeA,
      children: [
        { ...nodeB, children: [{ ...nodeD, children: [] }] },
        { ...nodeC, children: [] },
      ],
    },
  ])
})
