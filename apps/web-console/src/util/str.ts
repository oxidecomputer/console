export const capitalize = (s: string | null | undefined) =>
  s && s.charAt(0).toUpperCase() + s.slice(1)
