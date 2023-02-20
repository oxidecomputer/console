import type { Replace } from 'type-fest'

import { exclude } from '@oxide/util'

// notes on needed helpers: sometimes you need to select an instance with
//
//   { path: { instance }, query: { project, organization } }
//
// and sometimes you need
//
//   { query: { instance, project, organization } }
//
// so converting between those two forms probably makes sense. Having a name for
// each form will probably be necessary. Another thing we often need to do is
// extract a selector from the RR path params
//
// PathBuilder probably also needs to change to take the selector form instead
// of the names
//
// We may also want to change the names of the params in the URL? on the other
// hand it's nice to be explcit that they're names if that's what they are, and
// the helpers will make it tolerable. If we plan on keeping the route structure
// in the console, then maybe we actually want the helpers to go the other way:
// the canonical form is `{ orgName, projectName, instanceName }`, and we have
// helpers `toQuery` and `toPathQuery` for converting to the API forms. In order
// to do this cleanly, we should probably make it so the names can be converted
// trivially by stripping `-Name` off the end. Does this mean we need to change
// `orgName` to `organizationName`? That would be huge headache so it might be
// better to handle that one specially for now. However, that messes up the types.

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
