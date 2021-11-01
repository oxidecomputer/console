import React from 'react'

import type {
  RouteMatch,
  RouteObject,
  RouteProps as RRRouteProps,
} from 'react-router'
import { Navigate, Route as RRRoute, Routes } from 'react-router-dom'

import InstanceCreatePage from './pages/instances/create'
import InstanceStorage from './pages/instances/Storage'
import OrgPage from './pages/OrgPage'
import ProjectPage from './pages/project'
import ProjectAccessPage from './pages/project/Access'
import ProjectStoragePage from './pages/project/Storage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import ProjectsPage from './pages/ProjectsPage'
import ToastTestPage from './pages/ToastTestPage'

import RootLayout from './layouts/RootLayout'
import OrgLayout from './layouts/OrgLayout'
import ProjectLayout from './layouts/ProjectLayout'
import InstanceLayout from './layouts/InstanceLayout'

// function arm lets us make labels that depend on route params
type Crumb = string | ((m: RouteMatch) => string)

type RouteProps = RRRouteProps & {
  crumb?: Crumb
}

export type CustomRouteObject = RouteObject & {
  crumb?: Crumb
}

/** Custom `<Route>` that accepts whatever props we want. */
const Route = (props: RouteProps) => <RRRoute {...props} />

/*
 * We are doing something a little unorthodox with the route config here. We
 * realized that tagging nodes in the route tree with arbitrary data is very
 * powerful. It lets us handle breadcrumbs in a very straightforward way. Every
 * chunk of route that we want to be represented in the breadcrumbs gets a
 * `crumb` prop. Then, in order to get the breadcrumbs for a route, all we need
 * to do is find the path down the tree to the current route, and each node
 * becomes a crumb, where the `crumb` prop gives the label, and the path for
 * that node gives the path.
 *
 * The config ends up being a bit more complicated that it would otherwise be
 * because, e.g., we have to do `orgs` and `:orgName` separately in order to get
 * a crumb for each; `orgs/:orgName` would otherwise be ok.
 */

/* eslint-disable @typescript-eslint/no-non-null-assertion */
const orgCrumb = (m: RouteMatch) => m.params.orgName!
const projectCrumb = (m: RouteMatch) => m.params.projectName!
const instanceCrumb = (m: RouteMatch) => m.params.instanceName!
/* eslint-enable @typescript-eslint/no-non-null-assertion */

/** React Router route config in JSX form */
export const routes = (
  <Routes>
    <Route
      index
      element={<Navigate to="/orgs/maze-war/projects" replace={true} />}
    />

    <Route path="orgs">
      <Route path=":orgName" element={<RootLayout />} crumb={orgCrumb}>
        <Route index element={<OrgPage />} />
      </Route>

      <Route path=":orgName" crumb={orgCrumb}>
        <Route path="projects" crumb="Projects">
          {/* ORG */}
          <Route element={<OrgLayout />}>
            <Route index element={<ProjectsPage />} />
            <Route
              path="new"
              element={<ProjectCreatePage />}
              crumb="Create project"
            />
          </Route>

          {/* PROJECT */}
          <Route
            path=":projectName"
            element={<ProjectLayout />}
            crumb={projectCrumb}
          >
            <Route index element={<ProjectPage />} />
            <Route path="instances">
              <Route index element={<ProjectPage />} />
              <Route
                path="new"
                element={<InstanceCreatePage />}
                crumb="Create instance"
              />
            </Route>
            <Route path="networking" crumb="Networking" />
            <Route
              path="storage"
              element={<ProjectStoragePage />}
              crumb="Storage"
            />
            <Route path="metrics" crumb="Metrics" />
            <Route path="audit" crumb="Audit" />
            <Route
              path="access"
              element={<ProjectAccessPage />}
              crumb="Access & IAM"
            />
            <Route path="settings" crumb="Settings" />
          </Route>

          {/* INSTANCE */}
          <Route path=":projectName" crumb={projectCrumb}>
            <Route path="instances" crumb="Instances">
              <Route
                path=":instanceName"
                // layout has to be here instead of one up because it handles
                // the breadcrumbs, which need instanceName to be defined
                element={<InstanceLayout />}
                crumb={instanceCrumb}
              >
                <Route index />
                <Route path="metrics" crumb="Metrics" />
                <Route path="activity" crumb="Activity" />
                <Route path="access" crumb="Access" />
                <Route path="resize" crumb="Resize" />
                <Route path="networking" crumb="Networking" />
                <Route
                  path="storage"
                  element={<InstanceStorage />}
                  crumb="Storage"
                />
                <Route path="tags" crumb="Tags" />
              </Route>
            </Route>
          </Route>
        </Route>
      </Route>
    </Route>

    <Route path="__debug" element={<RootLayout />}>
      <Route path="toasts" element={<ToastTestPage />} />
    </Route>
  </Routes>
)

/**
 * Turn JSX route config info object config.
 *
 * Copied from React Router with one modification: use a custom RouteObject type
 * in order to be able to put `crumb` prop directly on the <Route> elements
 * https://github.com/remix-run/react-router/blob/174fb105ee/packages/react-router/index.tsx#L685
 * */
function createRoutesFromChildren(
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

/** React Router route config in object form. Used by useMatches. */
export const routeConfig = createRoutesFromChildren(routes)
