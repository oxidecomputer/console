import { Access16Icon, Divider, Folder16Icon, Organization16Icon } from '@oxide/ui'

import { useRequiredParams } from 'app/hooks'
import { pb } from 'app/util/path-builder'

import { DocsLinkItem, NavLinkItem, Sidebar } from '../components/Sidebar'
import { Layout } from './helpers'

// We need to use absolute paths here because sometimes this layout is rendered
// at `/orgs/:orgName` and other times it's rendered at `/orgs/:orgName/access`.
// Relative paths would resolve differently in the two locations.

const OrgLayout = () => {
  const { orgName } = useRequiredParams('orgName')

  return (
    <Layout>
      <Sidebar.Nav>
        <NavLinkItem to={pb.orgs()} end>
          <Organization16Icon />
          Organizations
        </NavLinkItem>
        <DocsLinkItem />
      </Sidebar.Nav>
      <Divider />
      <Sidebar.Nav heading={orgName}>
        <NavLinkItem to={pb.projects({ orgName })}>
          <Folder16Icon title="Projects" />
          Projects
        </NavLinkItem>
        <NavLinkItem to={pb.orgAccess({ orgName })}>
          <Access16Icon title="Access & IAM" />
          Access &amp; IAM
        </NavLinkItem>
      </Sidebar.Nav>
    </Layout>
  )
}

export default OrgLayout
