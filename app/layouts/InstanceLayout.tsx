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
import { Breadcrumbs } from '../components/Breadcrumbs'
import { InstancePageHeader } from '../components/InstancePageHeader'

const InstanceLayout = () => {
  const { instanceName } = useParams()
  return (
    <PageContainer>
      <Sidebar>
        <Picker category="Instance" resource={instanceName} />
        <Divider />
        <NavList>
          <NavLinkItem to="">
            <Icon name="dashboard" /> Overview
          </NavLinkItem>
          <NavLinkItem to="metrics">
            <Icon name="metrics" /> Metrics
          </NavLinkItem>
          <NavLinkItem to="activity">
            <Icon name="document" /> Activity
          </NavLinkItem>
          <NavLinkItem to="access">
            <Icon name="access" /> Access &amp; IAM
          </NavLinkItem>
          <NavLinkItem to="resize">
            <Icon name="resize" /> Resize
          </NavLinkItem>
          <NavLinkItem to="networking">
            <Icon name="networking" /> Networking
          </NavLinkItem>
          <NavLinkItem to="storage">
            <Icon name="storage" /> Storage
          </NavLinkItem>
          <NavLinkItem to="tags">
            <Icon name="tags" /> Tags
          </NavLinkItem>
        </NavList>
      </Sidebar>
      <Main>
        <Breadcrumbs />
        <InstancePageHeader />
        <Outlet />
      </Main>
    </PageContainer>
  )
}

// hot reload doesn't work with `export default () => ...` ???
export default InstanceLayout
