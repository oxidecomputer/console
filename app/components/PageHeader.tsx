import { PageHeader as Header, PageTitle } from '@oxide/ui'
import invariant from 'tiny-invariant'
import { useMatches } from 'react-router-dom'

export function PageHeader() {
  const matches = useMatches()?.reverse()
  const titleMatch = matches?.find((m) => m.handle?.title || m.handle?.crumb)
  const iconMatch = matches?.find((m) => m.handle?.icon)
  let title = titleMatch?.handle.title || titleMatch?.handle.crumb
  if (typeof title === 'function') {
    title = title(titleMatch)
  }
  const icon =
    typeof iconMatch?.handle.icon === 'function'
      ? iconMatch.handle.icon(iconMatch)
      : iconMatch?.handle.icon
  invariant(title, 'Page missing title, check routes config to ensure one is provided')
  return (
    (title && (
      <Header>
        <PageTitle icon={icon}>{title}</PageTitle>
      </Header>
    )) ||
    null
  )
}
