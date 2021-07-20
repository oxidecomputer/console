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

const App = () => {
  return (
    <Router>
      <QuickMenu />
      <AppLayout>
        <Routes>
          <Route path="/">
            <Navigate to="/projects" />
          </Route>
          <Route path="/projects">
            <ProjectsPage />
          </Route>
          <Route path="/projects/new">
            <ProjectCreatePage />
          </Route>
          <Route path="/projects/:projectName/access">
            <ProjectAccessPage />
          </Route>
          <Route path="/projects/:projectName/instances/new">
            <InstanceCreatePage />
          </Route>
          <Route path="/projects/:projectName/instances/:instanceName">
            <InstancePage />
          </Route>
          <Route path="/projects/:projectName">
            <ProjectPage />
          </Route>
          <Route path="/__debug/toasts">
            <ToastTestPage />
          </Route>
        </Routes>
      </AppLayout>
    </Router>
  )
}

export default App
