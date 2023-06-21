export function splitDecimal(value: number) {
  const wholeNumber = Math.trunc(value)
  const decimal = value % 1 !== 0 ? round(value % 1, 2) : null
  return [
    wholeNumber.toLocaleString(),
    decimal ? '.' + decimal.toLocaleString().split('.')[1] : '',
  ]
}

export function round(num: number, digits: number) {
  const pow10 = Math.pow(10, digits)
  return Math.round((num + Number.EPSILON) * pow10) / pow10
}
