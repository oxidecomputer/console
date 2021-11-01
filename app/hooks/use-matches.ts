import React from 'react'
import type { RouteMatch, RouteObject } from 'react-router'
import { matchRoutes, useLocation } from 'react-router'

import type { Crumb } from '../app'
import { routes } from '../app'

console.log('use-matches', routes)

type CustomRouteObject = RouteObject & {
  crumb?: Crumb
}

/**
 * Turn JSX route config info object config
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

// do this outside useMatches so it only happens once at pageload
const routeConfig = createRoutesFromChildren(routes)

type CustomMatch = RouteMatch & {
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
export const useMatches = () =>
  matchRoutes(routeConfig, useLocation()) as CustomMatch[] | null
