import { parsePortRange } from './util'

describe('parsePortRange', () => {
  describe('parses', () => {
    it('parses single ports up to 5 digits', () => {
      expect(parsePortRange('0')).toEqual([0, 0])
      expect(parsePortRange('1')).toEqual([1, 1])
      expect(parsePortRange('123')).toEqual([123, 123])
      expect(parsePortRange('12356')).toEqual([12356, 12356])
    })

    it('parses ranges', () => {
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
