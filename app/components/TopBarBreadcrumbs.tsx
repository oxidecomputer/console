/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link, useParams } from 'react-router-dom'

import { Slash } from '~/ui/lib/Slash'
import { pb } from '~/util/path-builder'

export const TopBarBreadcrumbs = () => {
  const firstPathItem = window.location.pathname.split('/')[1]
  const secondPathItem = window.location.pathname.split('/')[2]
  return (
    <nav className="flex items-baseline gap-1" aria-label="Breadcrumb navigation">
      {firstPathItem === 'projects' && (
        <>
          <ProjectBreadcrumb />
          <InstanceBreadcrumb />
          <DisksBreadcrumb />
          <SnapshotsBreadcrumb />
          <ImagesBreadcrumb />
          <VpcsBreadcrumb />
          <VpcRouterBreadcrumb />
          <FloatingIpsBreadcrumb />
          <AccessBreadcrumb />
        </>
      )}
      {firstPathItem === 'images' && (
        <Breadcrumb to={pb.siloImages()} text="Silo Images" includeSeparator={false} />
      )}
      {firstPathItem === 'utilization' && (
        <Breadcrumb
          to={pb.siloUtilization()}
          text="Silo Utilization"
          includeSeparator={false}
        />
      )}
      {firstPathItem === 'access' && (
        <Breadcrumb to={pb.siloAccess()} text="Silo Access" includeSeparator={false} />
      )}
      {firstPathItem === 'system' && secondPathItem === 'silos' && <SilosBreadcrumb />}
    </nav>
  )
}

type BreadcrumbProps = {
  to: string
  text: string
  includeSeparator?: boolean
}
export const Breadcrumb = ({ to, text, includeSeparator = true }: BreadcrumbProps) => {
  return (
    <>
      {includeSeparator && <Slash />}
      <Link
        to={to}
        className="ox-breadcrumb whitespace-nowrap text-sans-sm text-secondary hover:text-default"
      >
        {text}
      </Link>
    </>
  )
}

/** If on a Project index or view page, returns appropriate breadcrumb links */
const ProjectBreadcrumb = () => {
  const { project } = useParams()
  // check to see if 'projects' is in the url
  const projects = window.location.pathname.split('/')[1] === 'projects'
  // if 'projects' is not in the URL, return null
  if (!projects) {
    return null
  }
  // at this point, we know 'projects' is in the URL
  // if project is not defined, return the root projects link
  const projectsLink = (
    <>
      <span className="mx-1 text-quinary selected:text-accent-disabled">&lt;</span>
      <Breadcrumb to="/projects" text="Projects" includeSeparator={false} />
    </>
  )
  if (!project) {
    return projectsLink
  }
  // if project is defined, return the root projects link and the project link, together
  return (
    <>
      {projectsLink}
      <Breadcrumb to={pb.project({ project })} text={project} />
    </>
  )
}

/** If on an Instance index or view page, returns appropriate breadcrumb links */
const InstanceBreadcrumb = () => {
  const { project, instance } = useParams()
  // can't have instances without a project
  if (!project) {
    return null
  }
  // check to see if 'instaces' is in the url
  const instances = window.location.pathname.split('/')[3] === 'instances'
  // if 'instances' is not in the URL, return null
  if (!instances) {
    return null
  }
  // at this point, we know 'instances' is in the URL
  // if instance is not defined, return the root instances link
  const instancesLink = <Breadcrumb to={pb.instances({ project })} text="Instances" />
  if (!instance) {
    return instancesLink
  }
  // if instance is defined, return the root instances link and the instance link, together
  return (
    <>
      {instancesLink}
      <Breadcrumb to={pb.instance({ project, instance })} text={instance} />
    </>
  )
}

/** If on the Disks index page, returns appropriate breadcrumb link */
const DisksBreadcrumb = () => {
  const { project } = useParams()
  // check to see if 'disks' is in the url
  const disks = window.location.pathname.split('/')[3] === 'disks'
  // if 'disks' is not in the URL, return null
  if (!project || !disks) {
    return null
  }
  return <Breadcrumb to={pb.disks({ project })} text="Disks" />
}

const SnapshotsBreadcrumb = () => {
  const { project } = useParams()
  // check to see if 'snapshots' is in the url
  const snapshots = window.location.pathname.split('/')[3] === 'snapshots'
  // if 'snapshots' is not in the URL, return null
  if (!project || !snapshots) {
    return null
  }
  return <Breadcrumb to={pb.snapshots({ project })} text="Snapshots" />
}

/** If on the Images index page, returns appropriate breadcrumb link
 *  Individual images are handled in a sidebar, so we don't need a
 *  breadcrumb link for individual image pages.
 */
const ImagesBreadcrumb = () => {
  const { project } = useParams()
  // check to see if 'images' is in the url
  const images = window.location.pathname.split('/')[3] === 'images'
  // if 'images' is not in the URL, return null
  if (!project || !images) {
    return null
  }
  return <Breadcrumb to={pb.projectImages({ project })} text="Images" />
}

const VpcsBreadcrumb = () => {
  const { project, vpc } = useParams()
  // check to see if 'vpcs' is in the url
  const vpcs = window.location.pathname.split('/')[3] === 'vpcs'
  // if 'vpcs' is not in the URL, return null
  if (!project || !vpcs) {
    return null
  }
  // at this point, we know 'vpcs' is in the URL
  // if vpc is not defined, return the root vpcs link
  const vpcsLink = <Breadcrumb to={pb.vpcs({ project })} text="VPCs" />
  if (!vpc) {
    return vpcsLink
  }
  // if vpc is defined, return the root vpcs link and the vpc link, together
  return (
    <>
      {vpcsLink}
      <Breadcrumb to={pb.vpc({ project, vpc })} text={vpc} />
    </>
  )
}

/** If on a Router index or view page, returns appropriate breadcrumb links */
const VpcRouterBreadcrumb = () => {
  const { project, vpc, router } = useParams()
  // can't have routers without a vpc
  if (!project || !vpc) {
    return null
  }
  // check to see if 'routers' is in the url
  const routers = window.location.pathname.split('/')[5] === 'routers'
  // if 'routers' is not in the URL, return null
  if (!routers) {
    return null
  }
  // at this point, we know 'routers' is in the URL
  // if router is not defined, return the root routers link
  const routersLink = <Breadcrumb to={pb.vpcRouters({ project, vpc })} text="Routers" />
  if (!router) {
    return routersLink
  }
  // if router is defined, return the root routers link and the router link, together
  return (
    <>
      {routersLink}
      <Breadcrumb to={pb.vpcRouter({ project, vpc, router })} text={router} />
    </>
  )
}

const FloatingIpsBreadcrumb = () => {
  const { project } = useParams()
  // check to see if 'floating-ips' is in the url
  const floatingIps = window.location.pathname.split('/')[3] === 'floating-ips'
  // if 'floating-ips' is not in the URL, return null
  if (!project || !floatingIps) {
    return null
  }
  return <Breadcrumb to={pb.floatingIps({ project })} text="Floating IPs" />
}

const AccessBreadcrumb = () => {
  const { project } = useParams()
  // check to see if 'access' is in the url
  const access = window.location.pathname.split('/')[3] === 'access'
  // if 'access' is not in the URL, return null
  if (!project || !access) {
    return null
  }
  return <Breadcrumb to={pb.projectAccess({ project })} text="Access" />
}

const SilosBreadcrumb = () => {
  const { silo } = useParams()
  // check to see if 'silos' is in the url
  const silos = window.location.pathname.split('/')[2] === 'silos'
  // if 'silos' is not in the URL, return null
  if (!silos) {
    return null
  }
  // at this point, we know 'silos' is in the URL
  // if silo is not defined, return the root silos link
  const silosLink = <Breadcrumb to={pb.silos()} text="Silos" includeSeparator={false} />
  if (!silo) {
    return silosLink
  }
  // if silo is defined, return the root silos link and the silo link, together
  return (
    <>
      {silosLink}
      <Breadcrumb to={pb.silo({ silo })} text={silo} />
    </>
  )
}
