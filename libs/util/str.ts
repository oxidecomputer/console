export const capitalize = (s: string | null | undefined) =>
  s && s.charAt(0).toUpperCase() + s.slice(1)

export const pluralize = (s: string, n: number) =>
  `${n} ${s}${n === 1 ? '' : 's'}`

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
