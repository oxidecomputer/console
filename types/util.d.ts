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

/** Join types for `P1` and `P2` where `P2` takes precedence in conflicts */
type Assign<P1, P2> = Omit<P1, keyof P2> & P2
