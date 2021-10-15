import React from 'react'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import InstanceCreatePage from './pages/instances/create'
import InstanceStorage from './pages/instances/Storage'
import ProjectPage from './pages/project'
import ProjectAccessPage from './pages/project/Access'
import ProjectStoragePage from './pages/project/Storage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import ProjectsPage from './pages/ProjectsPage'
import ToastTestPage from './pages/ToastTestPage'

import OrgLayout from './layouts/OrgLayout'
import InstanceLayout from './layouts/InstanceLayout'
import ProjectLayout from './layouts/ProjectLayout'
import QuickMenu from './components/QuickMenu'
import { ErrorBoundary } from './components/ErrorBoundary'
import { SkipLink } from '@oxide/ui'

const App = () => (
  <ErrorBoundary>
    <SkipLink id="skip-nav" />
    <Router>
      <QuickMenu />
      <Routes>
        <Route index element={<Navigate to="/projects" replace={true} />} />

        {/* ORG */}
        <Route path="projects" element={<OrgLayout />}>
          {/* separate from project detail pages because of the different layout */}
          <Route index element={<ProjectsPage />} />
          <Route path="new" element={<ProjectCreatePage />} />
        </Route>

        {/* PROJECT */}
        <Route path="projects/:projectName" element={<ProjectLayout />}>
          <Route index element={<ProjectPage />} />
          <Route path="instances">
            <Route index element={<ProjectPage />} />
            <Route path="new" element={<InstanceCreatePage />} />
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

        <Route path="__debug" element={<OrgLayout />}>
          <Route path="toasts" element={<ToastTestPage />} />
        </Route>
      </Routes>
    </Router>
  </ErrorBoundary>
)

export default App
