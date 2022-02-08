import type { SnakeCasedPropertiesDeep as Snakify, Simplify } from 'type-fest'

// these are used for turning our nice JS-ified API types back into the original
// API JSON types (snake cased and dates as strings) for use in our mock API

type StringifyDates<T> = T extends Date
  ? string
  : {
      [K in keyof T]: T[K] extends Array<infer U>
        ? Array<StringifyDates<U>>
        : StringifyDates<T[K]>
    }

/**
 * Snake case fields and convert dates to strings. Not intended to be a general
 * purpose JSON type!
 */
// Simplify dramatically improves the IDE type hint.
export type Json<B> = Simplify<Snakify<StringifyDates<B>>>
