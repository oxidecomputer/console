// keep only keys whose values extend V
type PickByValue<T, V> = {
  [K in keyof T as T[K] extends V ? K : never]: T[K]
}

// remove keys whose values extend V
type OmitByValue<T, V> = {
  [K in keyof T as T[K] extends V ? never : K]: T[K]
}
