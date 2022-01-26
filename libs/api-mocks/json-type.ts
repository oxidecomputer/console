// these are used for turning our nice JS-ified API types back into the original
// API JSON types (snake cased and dates as strings) for use in our mock API

// lmao
type NotDigit<S> = S extends
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  ? never
  : S

type SnakeCase<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Uppercase<T> & NotDigit<T>
      ? '_'
      : ''}${Lowercase<T>}${SnakeCase<U>}`
  : S

type Snakify<T> = {
  [K in keyof T as SnakeCase<string & K>]: T[K] extends Array<infer U>
    ? U extends Record<string, unknown>
      ? Array<Snakify<U>>
      : T[K]
    : T[K] extends Record<string, unknown>
    ? Snakify<T[K]>
    : T[K]
}

type DateToStr<T> = T extends Date
  ? string
  : {
      [K in keyof T]: T[K] extends Date
        ? string
        : T[K] extends Array<infer U>
        ? Array<DateToStr<U>>
        : DateToStr<T[K]>
    }

export type Json<B> = Snakify<DateToStr<B>>
