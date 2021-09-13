/**
 * Throw with mesasage if condition is falsy. Entire call stripped out by
 * Rollup in prod.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function invariant(condition: any, message: string) {
  if (process.env.NODE_ENV !== 'production') {
    if (!condition) {
      throw new Error(message)
    }
  }
}

// Miraculously, Rollup not only minifies out the inside of the function when
// `NODE_ENV` is 'production', it actually removes the entire function call from
// the calling code, which means long error messages don't end up in the
// production bundle. This was manually tested in the production build to make
// sure, but here's an example in Rollup REPL: https://bit.ly/3z5cbQG
