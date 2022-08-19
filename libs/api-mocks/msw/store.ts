/**
 * This is a fork of https://github.com/ropg/storage-as-an-object
 * storage-as-an-object is MIT license which can be found here:
 * https://github.com/ropg/storage-as-an-object/blob/7a12a1dd3bcc1b87a77e8202fae98ae25323b968/LICENSE
 */
import { clone } from './util'

interface StoreOptions<T extends Record<string, unknown>> {
  initialValues: T
  store?: Storage
}

/**
 * createStore Creates an object that's persisted to a storage target like
 * localStorage or sessionStorage
 *
 * @param {string} key - The name of the string in the store
 * @param {StoreOptions} [options] - Optional configuration
 * @returns {Object} - The object that your code interfaces with
 */
export function createStore<T extends Record<string, unknown>>(
  key: string,
  options: StoreOptions<T>
) {
  let cache = {} as T
  const store = options.store ?? window.sessionStorage

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const proxify = (obj: any) => {
    const validTypes = ['string', 'number', 'object', 'undefined', 'boolean']
    if (!validTypes.includes(typeof obj)) {
      throw new Error('StorageObject does not store this variable type')
    }
    if (typeof obj === 'object' && obj !== null) {
      if (obj instanceof Date) {
        return { __DATE: obj.toJSON() }
      }
      for (const key in obj) {
        obj[key] = proxify(obj[key])
      }
      return new Proxy(obj, {
        get(target, name) {
          const val = target[name]
          if (val && typeof val === 'object' && val.__DATE) {
            return new Date(val.__DATE)
          }
          return val
        },
        set(target, name, value) {
          target[name] = proxify(value)
          write()
          return true
        },
        deleteProperty(target, name) {
          delete target[name]
          write()
          return true
        },
      })
    }
    return obj
  }

  const write = () => {
    store[key] = JSON.stringify(cache)
  }

  const clear = () => {
    cache = clone(options.initialValues)
    proxify(cache)
    write()
  }
  Object.defineProperty(cache, 'clear', { value: clear })

  try {
    Object.assign(cache, JSON.parse(store[key]))
  } catch {
    Object.assign(cache, clone(options.initialValues))
  }
  cache = proxify(cache)
  write()

  return cache as T & { clear: () => void }
}
