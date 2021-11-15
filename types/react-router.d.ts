import type {
  RouteProps as OriginalRouteProps,
  RouteObject as OriginalRouteObject,
  RouteMatch as OriginalRouteMatch,
} from 'react-router'

declare module 'react-router' {
  type Crumb = string | ((m: RouteMatch) => string)
  export interface RouteProps extends OriginalRouteProps {
    crumb?: Crumb
  }
  export interface RouteObject extends OriginalRouteObject {
    crumb?: Crumb
  }
  export type RouteMatch = OriginalRouteMatch & {
    route: RouteObject
  }
  export function Route(props: RouteProps): React.ReactElement | null
}
