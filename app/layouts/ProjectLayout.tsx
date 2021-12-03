import React from 'react'
import { Outlet } from 'react-router-dom'

import {
  SkipLinkTarget,
  Access16Icon,
  Document16Icon,
  Instances16Icon,
  Metrics16Icon,
  Networking16Icon,
  Storage16Icon,
} from '@oxide/ui'
import { ContentPane, PageContainer } from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Sidebar, NavLink } from '../components/Sidebar'

const ProjectLayout = () => {
  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="project">
          <NavLink to="instances">
            <Instances16Icon /> Instances
          </NavLink>
          <NavLink to="snapshots">
            <Instances16Icon /> Snapshots
          </NavLink>
          <NavLink to="storage">
            <Storage16Icon /> Disks
          </NavLink>
          <NavLink to="access">
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLink>
          <NavLink to="images">
            <Access16Icon title="images" /> Images
          </NavLink>
          <NavLink to="vpcs">
            <Networking16Icon /> Networking
          </NavLink>
          <NavLink to="metrics">
            <Metrics16Icon /> Metrics
          </NavLink>
        </Sidebar.Nav>
      </Sidebar>
      <ContentPane>
        <Breadcrumbs />
        <SkipLinkTarget />
        <Outlet />
      </ContentPane>
    </PageContainer>
  )
}

export default ProjectLayout
