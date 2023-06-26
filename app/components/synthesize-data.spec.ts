import { synthesizeData } from './SystemMetric'

const pt = (timestamp: Date, value: number) => ({
  timestamp,
  datum: { datum: value, type: 'i64' as const },
})

describe('synthesizeData', () => {
  const start = new Date(2023, 3, 2)
  const mid1 = new Date(2023, 3, 3)
  const mid2 = new Date(2023, 3, 4)
  const end = new Date(2023, 3, 5)

  it('returns undefined when either input list is undefined', () => {
    expect(synthesizeData(undefined, undefined, start, end, (x) => x)).toEqual(undefined)
    expect(synthesizeData([], undefined, start, end, (x) => x)).toEqual(undefined)
    expect(synthesizeData(undefined, [], start, end, (x) => x)).toEqual(undefined)
  })

  it('adds 0s at start and end when there is no data', () => {
    expect(synthesizeData([], [], start, end, (x) => x)).toEqual([
      { timestamp: start.getTime(), value: 0 },
      { timestamp: end.getTime(), value: 0 },
    ])
  })

  it("adds start and end when there's data in range", () => {
    const result = synthesizeData(
      [pt(mid1, 4), pt(mid2, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 3 },
      { timestamp: mid1.getTime(), value: 4 },
      { timestamp: mid2.getTime(), value: 5 },
      { timestamp: end.getTime(), value: 5 },
    ])
  })

  it('valueTransform is applied to both data in range and synthetic start and end', () => {
    const result = synthesizeData(
      [pt(mid1, 4), pt(mid2, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => 2 * x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 6 },
      { timestamp: mid1.getTime(), value: 8 },
      { timestamp: mid2.getTime(), value: 10 },
      { timestamp: end.getTime(), value: 10 },
    ])
  })

  it('does not add synthentic start when existing data point matches start time exactly', () => {
    const result = synthesizeData(
      [pt(start, 4), pt(mid1, 5)],
      [pt(new Date(0), 3)],
      start,
      end,
      (x) => x
    )
    expect(result).toEqual([
      { timestamp: start.getTime(), value: 4 },
      { timestamp: mid1.getTime(), value: 5 },
      { timestamp: end.getTime(), value: 5 },
    ])
  })
})
