import { useMatches } from './use-matches'

export const useTitle = () => {
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
  return [title, icon] as const
}
