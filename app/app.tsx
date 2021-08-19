import React from 'react'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import InstanceCreatePage from './pages/InstanceCreatePage'
import ProjectPage from './pages/ProjectPage'
import ProjectAccessPage from './pages/ProjectAccessPage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import ProjectsPage from './pages/ProjectsPage'
import ToastTestPage from './pages/ToastTestPage'

import OrgLayout from './layouts/OrgLayout'
import InstanceLayout from './layouts/InstanceLayout'
import ProjectLayout from './layouts/ProjectLayout'
import QuickMenu from './components/QuickMenu'
import { ErrorBoundary } from './components/ErrorBoundary'

const App = () => (
  <ErrorBoundary>
    <Router>
      <QuickMenu />
      <Routes>
        <Route path="/" element={<Navigate to="/projects" replace={true} />} />

        {/* ORG */}
        <Route path="projects" element={<OrgLayout />}>
          {/* separate from project detail pages because of the different layout */}
          <Route path="/" element={<ProjectsPage />} />
          <Route path="new" element={<ProjectCreatePage />} />
        </Route>

        {/* PROJECT */}
        <Route path="/projects/:projectName" element={<ProjectLayout />}>
          <Route element={<ProjectPage />} />
          <Route path="instances">
            <Route path="/" element={<ProjectPage />} />
            <Route path="new" element={<InstanceCreatePage />} />
          </Route>
          <Route path="networking" />
          <Route path="storage" />
          <Route path="metrics" />
          <Route path="audit" />
          <Route path="access" element={<ProjectAccessPage />} />
          <Route path="settings" />
        </Route>

        {/* INSTANCE */}
        <Route
          path="/projects/:projectName/instances/:instanceName"
          element={<InstanceLayout />}
        >
          <Route path="/" />
          <Route path="metrics" />
          <Route path="activity" />
          <Route path="access" />
          <Route path="resize" />
          <Route path="networking" />
          <Route path="storage" />
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
