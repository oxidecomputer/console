export const pick = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as never))
  ) as Pick<T, K>

export const exclude = <T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  ...keys: K[]
) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => !keys.includes(key as never))
  ) as Exclude<T, K>
