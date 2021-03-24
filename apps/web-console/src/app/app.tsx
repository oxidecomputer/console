import React from 'react'
import AppLayout from '../app-layout/AppLayout'
import { Router } from '@reach/router'
import InstancePage from '../pages/instance/InstancePage'
import InstancesPage from '../pages/instance/InstancesPage'

const App = () => {
  return (
    <AppLayout>
      <Router>
        <InstancePage path="/" />
        <InstancesPage path="/projects/:projectId/instances" />
      </Router>
    </AppLayout>
  )
}

export default App
