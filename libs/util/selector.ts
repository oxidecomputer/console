import type { Replace } from 'type-fest'

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

type StripName<K extends string> = K extends `${infer K0}Name` ? K0 : K

/**
 * Turn
 *
 * ```ts
 * { orgName: 'abc', projectName: 'def' }
 * ```
 * into
 * ```ts
 * { organization: 'abc', project: 'def' }
 * ```
 *
 * while maintaining type-level awareness of keys. Note special handling of
 * `orgName` to avoid having to convert hundreds of lines of existing code to
 * use `organizationName`. Organizations are going to disappear anyway, which
 * will make this unnecessary.
 */
export function toApiSelector<K extends `${string}Name`>(selector: Record<K, string>) {
  return Object.fromEntries(
    Object.entries(selector).map(([k, v]) => [
      k === 'orgName' ? 'organization' : stripName(k as K),
      v,
    ])
  ) as { [K1 in StripName<Replace<K, 'orgName', 'organizationName'>>]: string }
}

const stripName = <K extends string>(nameKey: `${K}Name`) =>
  nameKey.replace(/Name$/, '') as StripName<K>
