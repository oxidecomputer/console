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

export type Crumb = string | ((m: RouteMatch) => string)

type RouteProps = RRRouteProps & {
  crumb?: Crumb
}

const Route = (props: RouteProps) => <RRRoute {...props} />

export const routes = (
  <Routes>
    <Route
      index
      element={<Navigate to="/orgs/maze-war/projects" replace={true} />}
    />

    <Route path="/orgs/:orgName" element={<RootLayout />}>
      <Route index element={<OrgPage />} />
    </Route>

    <Route path="/orgs/:orgName" crumb="Orgs">
      {/* ORG */}
      <Route path="projects" element={<OrgLayout />} crumb="Projects">
        {/* separate from project detail pages because of the different layout */}
        <Route index element={<ProjectsPage />} />
        <Route
          path="new"
          element={<ProjectCreatePage />}
          crumb="Create project"
        />
      </Route>

      {/* PROJECT */}
      <Route path="projects/:projectName" element={<ProjectLayout />}>
        <Route index element={<ProjectPage />} />
        <Route path="instances">
          <Route index element={<ProjectPage />} />
          <Route
            path="new"
            element={<InstanceCreatePage />}
            crumb="Create instance"
          />
        </Route>
        <Route path="networking" />
        <Route path="storage" element={<ProjectStoragePage />} />
        <Route path="metrics" />
        <Route path="audit" />
        <Route path="access" element={<ProjectAccessPage />} />
        <Route path="settings" />
      </Route>

      {/* INSTANCE */}
      <Route
        path="projects/:projectName/instances/:instanceName"
        element={<InstanceLayout />}
      >
        <Route index />
        <Route path="metrics" />
        <Route path="activity" />
        <Route path="access" />
        <Route path="resize" />
        <Route path="networking" />
        <Route path="storage" element={<InstanceStorage />} />
        <Route path="tags" />
      </Route>
    </Route>

    <Route path="__debug" element={<RootLayout />}>
      <Route path="toasts" element={<ToastTestPage />} />
    </Route>
  </Routes>
)

const App = () => (
  <ErrorBoundary>
    <SkipLink id="skip-nav" />
    <Router>{routes}</Router>
  </ErrorBoundary>
)

export default App
