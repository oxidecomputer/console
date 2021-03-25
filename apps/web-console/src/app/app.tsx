import React from 'react'
import AppLayout from '../app-layout/AppLayout'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import InstancePage from '../pages/instance/InstancePage'
import InstancesPage from '../pages/instance/InstancesPage'

const App = () => {
  return (
    <AppLayout>
      <Router>
        <Route path="/" exact>
          <InstancePage />
        </Route>
        <Route path="/projects/:projectId/instances">
          <InstancesPage />
        </Route>
      </Router>
    </AppLayout>
  )
}

export default App
