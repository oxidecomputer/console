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

import AppLayout from './components/AppLayout'
import QuickMenu from './components/QuickMenu'

const App = () => (
  <Router>
    <QuickMenu />
    <Routes>
      <Route path="/" element={<Navigate to="/projects" />} />
      <Route path="projects" element={<AppLayout />}>
        <Route path="/" element={<ProjectsPage />} />
        <Route path="new" element={<ProjectCreatePage />} />
        <Route path=":projectName">
          <Route path="/" element={<ProjectPage />} />
          <Route path="access" element={<ProjectAccessPage />} />
          <Route path="instances">
            <Route path="/" element={<ProjectPage />} />
            <Route path="new" element={<InstanceCreatePage />} />
            <Route path=":instanceName" element={<InstancePage />} />
          </Route>
        </Route>
      </Route>
      <Route path="__debug/toasts" element={<ToastTestPage />} />
    </Routes>
  </Router>
)

export default App
