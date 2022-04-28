/* eslint-disable @typescript-eslint/no-explicit-any */

export const pick = <T, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key as never))
  ) as Pick<T, K>

export const unsafe_get = (obj: any, path: string) => {
  let current = obj
  const parts = path.split('.')
  for (const part of parts) {
    current = current[part]
  }
  return current
}

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> & string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T

export type Path<T> = PathImpl2<T> extends string | keyof T ? PathImpl2<T> : keyof T
