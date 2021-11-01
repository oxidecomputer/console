import React from 'react'
import { Route as RRRoute } from 'react-router'
import type {
  RouteMatch,
  RouteObject,
  RouteProps as RRRouteProps,
} from 'react-router'

type Crumb = string | ((m: RouteMatch) => string)

type RouteProps = RRRouteProps & {
  crumb?: Crumb
}

export const Route = (props: RouteProps) => <RRRoute {...props} />

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
