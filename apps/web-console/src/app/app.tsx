import React from 'react'
import AppLayout from '../app-layout/AppLayout'
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from 'react-router-dom'
import InstancePage from '../pages/instance/InstancePage'
import InstancesPage from '../pages/instance/InstancesPage'
import InstanceCreatePage from '../pages/instance/InstanceCreatePage'
import ProjectPage from '../pages/projects/ProjectPage'
import ProjectAccessPage from '../pages/projects/ProjectAccessPage'
import ProjectCreatePage from '../pages/projects/ProjectCreatePage'
import ProjectsPage from '../pages/projects/ProjectsPage'
import ToastTestPage from '../pages/ToastTestPage'

const App = () => {
  return (
    <Router>
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
          <Route path="/projects/:projectName/instances" exact>
            <InstancesPage />
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
