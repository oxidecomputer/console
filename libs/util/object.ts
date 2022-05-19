/* eslint-disable @typescript-eslint/no-explicit-any */

export const pick = <T, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as never))
  ) as Pick<T, K>
