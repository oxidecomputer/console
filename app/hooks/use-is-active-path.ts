/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useLocation, useResolvedPath } from 'react-router'

interface ActivePathOptions {
  to: string
  end?: boolean
}
/**
 * Returns true if the provided path is currently active.
 *
 * This implementation is based on logic from React Router's NavLink component.
 *
 * @see https://github.com/remix-run/react-router/blob/67f16e73603765158c63a27afb70d3a4b3e823d3/packages/react-router/index.tsx#L448-L467
 *
 * @param to The path to check
 * @param options.end Ensure this path isn't matched as "active" when its descendant paths are matched.
 */
export const useIsActivePath = ({ to, end }: ActivePathOptions) => {
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
