export const capitalize = (s: string | null | undefined) =>
  s && s.charAt(0).toUpperCase() + s.slice(1)

export const pluralize = (s: string, n: number) =>
  `${n} ${s}${n === 1 ? '' : 's'}`
