import { expect, it } from 'vitest'

import { splitDecimal } from './math'

it.each([
  [1.23, ['1', '.23']],
  [1, ['1', '']], // whole number decimal should be an empty string
  [1.252525, ['1', '.25']],
  [1.259, ['1', '.26']], // should correctly round the decimal
  [-50.2, ['-50', '.2']], // should correctly not round down to -51
  [1000.5, ['1,000', '.5']], // testing localeString
  [49.00000001, ['49', '']],
])('splitDecimal', (input, output) => {
  expect(splitDecimal(input)).toEqual(output)
})
