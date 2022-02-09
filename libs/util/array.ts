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
