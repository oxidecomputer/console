import { exclude } from '@oxide/util'

/**
 * Convert a selector to API params with one key in `path` and the rest in
 * `query`. To add extra query params like `limit`, just include them in
 * `selector` and they'll end up in `query` like everything else.
 *
 * Mapped types are hard to read here, but they give the calling code nice
 * inference.
 */
export const toPathQuery = <K extends string, PK extends K>(
  pathKey: PK,
  selector: Record<K, string>
) => ({
  path: { [pathKey]: selector[pathKey] } as { [K0 in PK]: string },
  query: exclude(selector, pathKey) as { [K0 in Exclude<K, PK>]: string },
})
