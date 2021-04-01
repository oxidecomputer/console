import React from 'react'
import AppLayout from '../app-layout/AppLayout'
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom'
import InstancePage from '../pages/instance/InstancePage'
import InstancesPage from '../pages/instance/InstancesPage'

const App = () => {
  return (
    <AppLayout>
      <Router>
        <Switch>
          <Route path="/" exact>
            <InstancePage />
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
