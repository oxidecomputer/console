import type {
  RouteProps as OriginalRouteProps,
  RouteObject as OriginalRouteObject,
} from 'react-router-dom'

declare module 'react-router-dom' {
  type Crumb = string | ((m: RouteMatch) => string)
  type Title = string | ((m: RouteMatch) => string)
  type Icon = ReactElement | ((m: RouteMatch) => ReactElement)
  export interface RouteProps extends OriginalRouteProps {
    crumb?: Crumb
    title?: Title
    icon?: Icon
  }
  export interface RouteObject extends OriginalRouteObject {
    crumb?: Crumb
    title?: Title
    icon?: Icon
  }
  export function Route(props: RouteProps): React.ReactElement | null
}
