/**
 * Produces the cartesian product of a set of lists.
 *
 * Example:
 *
 * ```typescript
 * product([1, 2], ['a', 'b'])
 * // [[1, 'a'], [1, 'b'], [2, 'a'], [3, 'b']]
 * ```
 * See: https://en.wikipedia.org/wiki/Cartesian_product
 *
 * @param items List of lists to combine
 */
export const product = <T>(...items: T[][]): T[][] => {
  const combine = (acc: T[][], [head, ...tail]: T[][]): T[][] => {
    if (!head) return acc
    if (acc.length === 0)
      return combine(
        head.map((v) => [v]),
        tail
      )

    return combine(
      [].concat(...acc.map((a) => head.map((b) => [...a, b]))),
      tail
    )
  }

  return combine([], items)
}
