import { PageHeader as Header, PageTitle } from '@oxide/ui'
import invariant from 'tiny-invariant'
import { useMatches } from 'app/hooks/use-matches'
import { capitalize } from '@oxide/util'

export function PageHeader() {
  const matches = useMatches()?.reverse()
  const titleMatch = matches?.find((m) => m.route.title || m.route.crumb)
  const iconMatch = matches?.find((m) => m.route.icon)
  let title = titleMatch?.route.title || titleMatch?.route.crumb
  if (typeof title === 'function') {
    title = title(titleMatch)
  }
  const icon =
    typeof iconMatch?.route.icon === 'function'
      ? iconMatch.route.icon(iconMatch)
      : iconMatch?.route.icon
  invariant(title, 'Page missing title, check routes config to ensure one is provided')
  return (
    (title && (
      <Header>
        <PageTitle icon={icon}>{capitalize(title)}</PageTitle>
      </Header>
    )) ||
    null
  )
}
