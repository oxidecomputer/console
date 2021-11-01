import React from 'react'

import type { RouteMatch, RouteProps as RRRouteProps } from 'react-router'
import {
  BrowserRouter as Router,
  Navigate,
  Route as RRRoute,
  Routes,
} from 'react-router-dom'

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

import { ErrorBoundary } from './components/ErrorBoundary'
import { SkipLink } from '@oxide/ui'

// function arm lets us make labels that depend on route params
export type Crumb = string | ((m: RouteMatch) => string)

type RouteProps = RRRouteProps & {
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
/** React Router route config in JSX form */
export const routes = (
  <Routes>
    <Route
      index
      element={<Navigate to="/orgs/maze-war/projects" replace={true} />}
    />

    <Route path="orgs">
      <Route
        path=":orgName"
        element={<RootLayout />}
        crumb={(m: RouteMatch) => m.params.orgName!}
      >
        <Route index element={<OrgPage />} />
      </Route>

      <Route path=":orgName" crumb={(m: RouteMatch) => m.params.orgName!}>
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
            crumb={(m: RouteMatch) => m.params.projectName!}
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
          <Route
            path=":projectName"
            crumb={(m: RouteMatch) => m.params.projectName!}
          >
            <Route path="instances" crumb="Instances">
              <Route
                path=":instanceName"
                // layout has to be here instead of one up because it handles
                // the breadcrumbs, which need instanceName to be defined
                element={<InstanceLayout />}
                crumb={(m: RouteMatch) => m.params.instanceName!}
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
/* eslint-enable @typescript-eslint/no-non-null-assertion */

const App = () => (
  <ErrorBoundary>
    <SkipLink id="skip-nav" />
    <Router>{routes}</Router>
  </ErrorBoundary>
)

export default App
