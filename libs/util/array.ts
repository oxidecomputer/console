/* eslint-disable @typescript-eslint/no-explicit-any */
const identity = (x: any) => x

/** Returns a new array sorted by `by`. Assumes return value of `by` is
 * comparable. Default value of `by` is the identity function. */
export function sortBy<T>(arr: T[], by: (t: T) => any = identity) {
  const copy = [...arr]
  copy.sort((a, b) => (by(a) < by(b) ? -1 : by(a) > by(b) ? 1 : 0))
  return copy
}
/* eslint-enable @typescript-eslint/no-explicit-any */

type Truthy<T> = T extends false | '' | 0 | null | undefined ? never : T

/**
 * TS-friendly version of `Boolean` for when you want to filter for truthy
 * values. Use `.filter(truthy)` instead of `.filter(Boolean)`. See
 * [StackOverflow](https://stackoverflow.com/a/58110124/604986).
 */
export function isTruthy<T>(value: T): value is Truthy<T> {
  return !!value
}
