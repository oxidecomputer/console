export function splitDecimal(value: number) {
  const wholeNumber = Math.trunc(value)
  const decimal = value % 1 !== 0 ? value % 1 : null
  return [
    wholeNumber.toString(),
    decimal ? '.' + decimal.toFixed(2).toString().split('.')[1] : '',
  ]
}

export function round(num: number, digits: number) {
  const pow10 = Math.pow(10, digits)
  return Math.round((num + Number.EPSILON) * pow10) / pow10
}
