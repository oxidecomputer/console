import React from 'react'
import type { RouteMatch, RouteObject } from 'react-router'
import { matchRoutes, useLocation } from 'react-router'

import type { Crumb } from '../app'
import { routes } from '../app'

type CustomRouteObject = RouteObject & {
  crumb?: Crumb
}

type CustomMatch = RouteMatch & {
  route: CustomRouteObject
}

/**
 * Turn JSX route config info object config.
 *
 * Copied from React Router with one modification: use a custom RouteObject type
 * in order to be able to put `crumb` prop directly on the <Route> elements
 * https://github.com/remix-run/react-router/blob/174fb105ee/packages/react-router/index.tsx#L685
 * */
export function createRoutesFromChildren(
  children: React.ReactNode
): CustomRouteObject[] {
  const routes: CustomRouteObject[] = []

  React.Children.forEach(children, (element) => {
    if (!React.isValidElement(element)) {
      // Ignore non-elements. This allows people to more easily inline
      // conditionals in their route config.
      return
    }

    if (element.type === React.Fragment) {
      // Transparently support React.Fragment and its children.
      routes.push(...createRoutesFromChildren(element.props.children))
      return
    }

    // only real difference from the original: allow arbitrary props
    const route: CustomRouteObject = { ...element.props }

    if (element.props.children) {
      route.children = createRoutesFromChildren(element.props.children)
    }

    routes.push(route)
  })

  return routes
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
export const useMatches = (): CustomMatch[] | null => {
  // This needs to be in here instead of outside at top level to avoid a
  // circular dependency issue. it complains that `routes` is not initialized
  // yet. If we want to avoid doing this on every component mount, we can put
  // the route config object on a top-level Context instead.
  const routeConfig = React.useMemo(() => createRoutesFromChildren(routes), [])
  return matchRoutes(routeConfig, useLocation())
}
