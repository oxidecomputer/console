import { invariant } from '@oxide/util'
import type { ReactElement } from 'react'
import { useMatches } from './use-matches'

/**
 * Retrieves a `title` and `icon` from the closest route of the route tree
 * If a `crumb` is found before a `title`, the `crumb` will be used as the title
 * instead. This is largely in part because most crumbs and titles are the same.
 */
export const useTitle = (): [title: string, icon: ReactElement] => {
  const matches = useMatches()?.reverse()
  const titleMatch = matches?.find((m) => m.route.title || m.route.crumb)
  const iconMatch = matches?.find((m) => m.route.icon)
  let title = ''
  if (titleMatch?.route.title) {
    title =
      typeof titleMatch.route.title === 'function'
        ? titleMatch.route.title(titleMatch)
        : titleMatch.route.title
  } else if (titleMatch?.route.crumb) {
    title =
      typeof titleMatch?.route.crumb === 'function'
        ? titleMatch.route.crumb(titleMatch)
        : titleMatch.route.crumb
  }
  const icon =
    typeof iconMatch?.route.icon === 'function'
      ? iconMatch.route.icon(iconMatch)
      : iconMatch?.route.icon
  invariant(
    title,
    'Page missing title, check routes config to ensure one is provided'
  )
  return [title, icon]
}
