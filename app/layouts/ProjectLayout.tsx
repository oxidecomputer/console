import React from 'react'
import { Outlet } from 'react-router-dom'

import {
  SkipLinkTarget,
  Access16Icon,
  Instances16Icon,
  Metrics16Icon,
  Networking16Icon,
  Storage16Icon,
  Notification16Icon,
  Resize16Icon,
} from '@oxide/ui'
import { ContentPane, PageContainer } from './helpers'
import { Breadcrumbs } from '../components/Breadcrumbs'
import { Sidebar, NavLinkItem } from '../components/Sidebar'
import { useParams } from '../hooks'

const ProjectLayout = () => {
  const { orgName, projectName } = useParams('orgName', 'projectName')
  const root = `/orgs/${orgName}/projects/${projectName}`
  return (
    <PageContainer>
      <Sidebar>
        <Sidebar.Nav heading="project">
          <NavLinkItem to={`${root}/instances`}>
            <Instances16Icon /> Instances
          </NavLinkItem>
          <NavLinkItem to={`${root}/snapshots`}>
            <Notification16Icon /> Snapshots
          </NavLinkItem>
          <NavLinkItem to={`${root}/storage`}>
            <Storage16Icon /> Disks
          </NavLinkItem>
          <NavLinkItem to={`${root}/access`}>
            <Access16Icon title="Access & IAM" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to={`${root}/images`}>
            <Resize16Icon title="images" /> Images
          </NavLinkItem>
          <NavLinkItem to={`${root}/vpcs`}>
            <Networking16Icon /> Networking
          </NavLinkItem>
          <NavLinkItem to={`${root}/metrics`}>
            <Metrics16Icon /> Metrics
          </NavLinkItem>
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
