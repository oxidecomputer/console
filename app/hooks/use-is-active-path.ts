import { useLocation, useResolvedPath } from 'react-router-dom'

interface ActivePathOptions {
  end?: boolean
}
/**
 * Returns true if the provided path is currently active.
 *
 * This implementation is based on logic from React Router's NavLink component.
 *
 * @see https://github.com/remix-run/react-router/blob/67f16e73603765158c63a27afb70d3a4b3e823d3/packages/react-router-dom/index.tsx#L448-L467
 *
 * @param to The path to check
 * @param options.end Ensure this path isn't matched as "active" when its descendant paths are matched.
 */
export const useIsActivePath = (to: string, { end }: ActivePathOptions = {}) => {
  const path = useResolvedPath(to)
  const location = useLocation()

  const toPathname = path.pathname
  const locationPathname = location.pathname

  return (
    locationPathname === toPathname ||
    (!end &&
      locationPathname.startsWith(toPathname) &&
      locationPathname.charAt(toPathname.length) === '/')
  )
}
