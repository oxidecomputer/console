import React from 'react'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
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
        <Switch>
          <Route path="/" exact>
            <Redirect to="/projects" />
          </Route>
          <Route path="/projects" exact>
            <ProjectsPage />
          </Route>
          <Route path="/projects/new" exact>
            <ProjectCreatePage />
          </Route>
          <Route path="/projects/:projectName/access" exact>
            <ProjectAccessPage />
          </Route>
          <Route path="/projects/:projectName/instances/new" exact>
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
        </Switch>
      </AppLayout>
    </Router>
  )
}

export default App
