/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const capitalize = (s: string) => s && s.charAt(0).toUpperCase() + s.slice(1)

export const pluralize = (s: string, n: number) => `${n} ${s}${n === 1 ? '' : 's'}`

export const camelCase = (s: string) =>
  s
    .replace(/[\W|_]+/g, ' ')
    .replace(
      /([A-Z])([A-Z]+)/g,
      (_, first, remaining) => `${first}${remaining.toLowerCase()}`
    )

    .replace(/(?:^\w|[A-Z]|\b\w)/g, (leftTrim, idx) =>
      idx === 0 ? leftTrim.toLowerCase() : leftTrim.toUpperCase()
    )
    .replace(
      /([A-Z])([A-Z]+)/g,
      (_, first, remaining) => `${first}${remaining.toLowerCase()}`
    )
    .replace(/\s+/g, '')

export const kebabCase = (s: string) =>
  camelCase(s)
    .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
    .toLowerCase()

export const camelCaseToWords = (s: string): string[] => {
  return s.split(/(?=[A-Z])/).map((w) => w.toLowerCase())
}

export const commaSeries = (items: string[], conj: string) => {
  if (items.length <= 2) {
    return items.join(` ${conj} `)
  }
  return [...items.slice(0, -1), `${conj} ${items.at(-1)}`].join(', ')
}

export const titleCase = (text: string): string => {
  return text.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  )
}

/**
 * Does a base64 string represent underlying data that's all zeros, i.e., does
 * it look like `AAAAAAAAAAAAAAAA==`?
 */
export const isAllZeros = (base64Data: string) => /^A*=*$/.test(base64Data)
