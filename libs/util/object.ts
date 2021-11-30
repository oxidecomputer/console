export const pick = <T, K extends keyof T>(obj: T, ...keys: K[]) =>
  Object.fromEntries(
    Object.entries(obj).filter(([key]) => keys.includes(key))
  ) as Pick<T, K>

export const unsafe_get = (obj: any, path: string) => {
  let current = obj
  const parts = path.split('.')
  for (const part of parts) {
    current = current[part]
  }
  return current
}
export const get = unsafe_get as <T, P extends Path<T>>(
  obj: T,
  path: P
) => PathValue<T, P>

type PathImpl<T, Key extends keyof T> = Key extends string
  ? T[Key] extends Record<string, any>
    ?
        | `${Key}.${PathImpl<T[Key], Exclude<keyof T[Key], keyof any[]>> &
            string}`
        | `${Key}.${Exclude<keyof T[Key], keyof any[]> & string}`
    : never
  : never

type PathImpl2<T> = PathImpl<T, keyof T> | keyof T

export type Path<T> = PathImpl2<T> extends string | keyof T
  ? PathImpl2<T>
  : keyof T

type PathValue<T, P extends Path<T>> = P extends `${infer Key}.${infer Rest}`
  ? Key extends keyof T
    ? Rest extends Path<T[Key]>
      ? PathValue<T[Key], Rest>
      : never
    : never
  : P extends keyof T
  ? T[P]
  : never
