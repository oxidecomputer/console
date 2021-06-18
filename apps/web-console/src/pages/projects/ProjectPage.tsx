import React from 'react'
import { useParams } from 'react-router-dom'
import { TabPanel } from '@reach/tabs'
import 'twin.macro'

import { useApiQuery } from '@oxide/api'
import { Breadcrumbs, PageHeader, PageTitle } from '@oxide/ui'
import { RouterTabs } from '../../components/router-tabs/RouterTabs'
import InstancesPage from '../../pages/instance/InstancesPage'
import { useBreadcrumbs } from '../../hooks'

type Params = {
  projectName: string
}

const tabs = [
  { label: 'Overview', path: '/' },
  { label: 'Instances', path: '/instances' },
  { label: 'Networking', path: '/networking' },
  { label: 'Storage', path: '/storage' },
  { label: 'Settings', path: '/settings' },
]

const ProjectPage = () => {
  const breadcrumbs = useBreadcrumbs()

  const { projectName } = useParams<Params>()
  const { data: project } = useApiQuery('apiProjectsGetProject', {
    projectName,
  })
  const { data: instances } = useApiQuery('apiProjectInstancesGet', {
    projectName,
  })

  if (!project || !instances) return <div>loading</div>

  return (
    <>
      <Breadcrumbs data={breadcrumbs} />
      <PageHeader>
        <PageTitle icon="project">{project.name}</PageTitle>
      </PageHeader>

      <ul css={{ listStyleType: 'disc', margin: '1rem' }}>
        <li>ID: {project.id}</li>
        <li>Description: {project.description}</li>
      </ul>

      <RouterTabs tw="mt-4" tabs={tabs}>
        <TabPanel>Overview</TabPanel>
        <TabPanel>
          <InstancesPage />
        </TabPanel>
        <TabPanel>Networking</TabPanel>
        <TabPanel>Storage</TabPanel>
        <TabPanel>Settings</TabPanel>
      </RouterTabs>
    </>
  )
}

export default ProjectPage
