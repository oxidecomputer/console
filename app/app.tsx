import React from 'react'
import {
  BrowserRouter as Router,
  Navigate,
  Route,
  Routes,
} from 'react-router-dom'

import InstancePage from './pages/InstancePage'
import InstanceCreatePage from './pages/InstanceCreatePage'
import ProjectPage from './pages/ProjectPage'
import ProjectAccessPage from './pages/ProjectAccessPage'
import ProjectCreatePage from './pages/ProjectCreatePage'
import ProjectsPage from './pages/ProjectsPage'
import ToastTestPage from './pages/ToastTestPage'

import AppLayout from './layouts/AppLayout'
import InstanceLayout from './layouts/InstanceLayout'
import ProjectLayout from './layouts/ProjectLayout'
import QuickMenu from './components/QuickMenu'

const App = () => (
  <Router>
    <QuickMenu />
    <Routes>
      <Route path="/" element={<Navigate to="/projects" replace={true} />} />
      <Route path="projects" element={<AppLayout />}>
        {/* separate from project detail pages because of the different layout */}
        <Route path="/" element={<ProjectsPage />} />
        <Route path="new" element={<ProjectCreatePage />} />
      </Route>
      <Route
        path="/projects/:projectName/instances/:instanceName"
        element={<InstanceLayout />}
      >
        <Route path="/" element={<InstancePage />} />
      </Route>
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
      <Route path="__debug" element={<AppLayout />}>
        <Route path="toasts" element={<ToastTestPage />} />
      </Route>
    </Routes>
  </Router>
)

export default App
