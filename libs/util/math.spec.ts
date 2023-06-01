import { splitDecimal } from './math'

it.each([
  [1.23, ['1', '.23']],
  [1, ['1', '']],
  [1.252525, ['1', '.25']],
  [1.259, ['1', '.26']],
  [-50.2, ['-50', '.20']],
])('splitDecimal', (input, output) => {
  expect(splitDecimal(input)).toEqual(output)
})
