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

const App = () => {
  return (
    <AppLayout>
      <Router>
        <Switch>
          <Route path="/" exact>
            <Redirect to="/projects/prod-online/instances/db1" />
          </Route>
          <Route path="/projects/:projectName/instances/new">
            <InstanceCreatePage />
          </Route>
          <Route path="/projects/:projectName/instances/:instanceName">
            <InstancePage />
          </Route>
          <Route path="/projects/:projectName/instances">
            <InstancesPage />
          </Route>
        </Switch>
      </Router>
    </AppLayout>
  )
}

export default App
