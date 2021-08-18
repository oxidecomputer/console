import React from 'react'
import { Outlet, useParams } from 'react-router-dom'

import { Icon } from '@oxide/ui'
import {
  Divider,
  Main,
  NavLinkItem,
  NavList,
  PageContainer,
  Picker,
  Sidebar,
} from './helpers'

const ProjectLayout = () => {
  const { projectName } = useParams()
  return (
    <PageContainer>
      <Sidebar>
        <Picker category="Project" resource={projectName} />
        <Divider />
        <NavList>
          <NavLinkItem to="">
            <Icon name="dashboard" /> Overview
          </NavLinkItem>
          <NavLinkItem to="instances">
            <Icon name="instances" /> Instances
          </NavLinkItem>
          <NavLinkItem to="networking">
            <Icon name="networking" /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <Icon name="storage" /> Storage
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <Icon name="metrics" /> Metrics
          </NavLinkItem>
          <NavLinkItem to="audit">
            <Icon name="document" /> Audit log
          </NavLinkItem>
          <NavLinkItem to="access">
            <Icon name="access" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="settings">
            <Icon name="settings" /> Settings
          </NavLinkItem>
        </NavList>
      </Sidebar>
      <Main>
        <Outlet />
      </Main>
    </PageContainer>
  )
}

export default ProjectLayout
