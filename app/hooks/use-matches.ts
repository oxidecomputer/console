import type { RouteMatch } from 'react-router'
import { matchRoutes, useLocation } from 'react-router'

import type { CustomRouteObject } from '../routes'
import { routeConfig } from '../routes'

export type CustomMatch = RouteMatch & {
  route: CustomRouteObject
}

/**
 * For the current location, return the path down the route config. For example,
 * if the route config is
 *
 * ```
 * <Route path="orgs">
 *   <Route path="projects">
 *     <Route path="new" />
 *   </Route
 * </Route
 * ```
 *
 * when you're on /orgs/projects/new, useMatches will give something like
 *
 * ```
 * [
 *   { pathname: '/orgs', ... },
 *   { pathname: '/orgs/projects', ... },
 *   { pathname: '/orgs/projects/new', ... },
 * ]
 * ```
 */
export const useMatches = (): CustomMatch[] | null =>
  matchRoutes(routeConfig, useLocation())
