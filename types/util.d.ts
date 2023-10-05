/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

/** Keep only keys whose values extend V */
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}

/** Remove keys whose values extend V */
type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K]
}

/** Make `K` optional on `T` */
type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>

/** Make `K` required on `T` */
type RequiredByKey<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>

/** Join types for `P1` and `P2` where `P2` takes precedence in conflicts */
type Assign<P1, P2> = Omit<P1, keyof P2> & P2

/**
 * Produce a version of `FewerKeys` that assigns a type of `never` to all keys
 * of `MoreKeys` that aren't in `FewerKeys`. Why? Good question:
 *
 * In most cases TS will error if you try to assign an object to a variable if
 * there are keys that are not in the type of that variable. But there are
 * situations where it will not:
 *
 *     type X = { a: number }
 *     const x: X = { a: 1, b: 2 } // error: b is not in X
 *     const arr: X[] = [{ a: 1, b: 2 }].map((x) => x) // no error
 *
 * To avoid this, we can use NoExtraKeys;
 *
 *     type X = { a: number }
 *     type Y = { a: number; b: number }
 *     type StrictX = NoExtraKeys<X, Y>
 *     const arr: StrictX[] = [{ a: 1, b: 2 }].map((x) => x) // error
 *
 * Which produces the following error:
 *
 *     Type '{ a: number; b: number; }' is not comparable to type '{ b?: undefined; }'.
 *       Types of property 'b' are incompatible.
 *         Type 'number' is not comparable to type 'undefined'.ts(2352)
 *
 * The `?` is necessary, otherwise the resulting type is impossible to instantiate.
 **/
type NoExtraKeys<FewerKeys, MoreKeys extends FewerKeys> = FewerKeys & {
  [K in Exclude<keyof MoreKeys, keyof FewerKeys>]?: never
}
