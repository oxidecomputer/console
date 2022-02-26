import type {
  RouteProps as OriginalRouteProps,
  RouteObject as OriginalRouteObject,
} from 'react-router-dom'

declare module 'react-router-dom' {
  type Crumb = string | ((m: RouteMatch) => string)
  export interface RouteProps extends OriginalRouteProps {
    crumb?: Crumb
  }
  export interface RouteObject extends OriginalRouteObject {
    crumb?: Crumb
  }
  export function Route(props: RouteProps): React.ReactElement | null
}
