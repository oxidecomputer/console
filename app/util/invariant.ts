// Used to assert runtime invariants in development and test. Miraculously,
// Rollup not only minifies out the inside of the function when `NODE_ENV` is
// 'production', it actually removes the entire function call from the calling
// code, which means arbitrarily long error messages don't end up in the
// production bundle. This was manually tested in the production build to make
// sure, but here's an example in Rollup REPL: https://bit.ly/3z5cbQG

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(condition: any, message: string) {
  if (process.env.NODE_ENV !== 'production') {
    if (!condition) {
      throw new Error(message)
    }
  }
}
