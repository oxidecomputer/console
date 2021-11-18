import format, { plugins } from 'pretty-format'

const print = (value: unknown) =>
  format(value, { plugins: [plugins.ReactElement] })

export const pp = (value: unknown) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(print(value))
  }
}
