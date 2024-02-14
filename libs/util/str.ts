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

// Borrowed from Valibot. I tried some from Zod and an O'Reilly regex cookbook
// but they didn't match results with std::new on simple test cases
// https://github.com/fabian-hiller/valibot/blob/2554aea5/library/src/regex.ts#L43-L54

export const IPV4_REGEX =
  /^(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])(?:\.(?:(?:[1-9]|1\d|2[0-4])?\d|25[0-5])){3}$/u

export const IPV6_REGEX =
  /^(?:(?:[\da-f]{1,4}:){7}[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,7}:|(?:[\da-f]{1,4}:){1,6}:[\da-f]{1,4}|(?:[\da-f]{1,4}:){1,5}(?::[\da-f]{1,4}){1,2}|(?:[\da-f]{1,4}:){1,4}(?::[\da-f]{1,4}){1,3}|(?:[\da-f]{1,4}:){1,3}(?::[\da-f]{1,4}){1,4}|(?:[\da-f]{1,4}:){1,2}(?::[\da-f]{1,4}){1,5}|[\da-f]{1,4}:(?::[\da-f]{1,4}){1,6}|:(?:(?::[\da-f]{1,4}){1,7}|:)|fe80:(?::[\da-f]{0,4}){0,4}%[\da-z]+|::(?:f{4}(?::0{1,4})?:)?(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d)|(?:[\da-f]{1,4}:){1,4}:(?:(?:25[0-5]|(?:2[0-4]|1?\d)?\d)\.){3}(?:25[0-5]|(?:2[0-4]|1?\d)?\d))$/iu
