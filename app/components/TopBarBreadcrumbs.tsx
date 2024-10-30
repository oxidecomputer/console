/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link, useParams } from 'react-router-dom'

import { PrevArrow12Icon } from '@oxide/design-system/icons/react'

import { Slash } from '~/ui/lib/Slash'
import { pb } from '~/util/path-builder'

export const TopBarBreadcrumbs = () => {
  const [, firstPathItem, secondPathItem, thirdPathItem, , fifthPathItem] =
    window.location.pathname.split('/')
  const { project } = useParams()
  return (
    <nav
      className="flex items-center gap-1 overflow-clip pr-4"
      aria-label="Breadcrumb navigation"
    >
      <PrevArrow12Icon className="mx-1.5 text-quinary" />

      {/* Silo page breadcrumbs */}
      {firstPathItem === 'projects' && (
        <>
          <Breadcrumb to="/projects" label="Projects" includeSeparator={false} />
          {project && (
            <>
              <Breadcrumb to={pb.project({ project })} label={project} />
              {thirdPathItem === 'instances' && <InstanceBreadcrumb project={project} />}
              {thirdPathItem === 'disks' && (
                <Breadcrumb to={pb.disks({ project })} label="Disks" />
              )}
              {thirdPathItem === 'snapshots' && (
                <Breadcrumb to={pb.snapshots({ project })} label="Snapshots" />
              )}
              {thirdPathItem === 'images' && (
                <Breadcrumb to={pb.projectImages({ project })} label="Images" />
              )}
              {thirdPathItem === 'vpcs' && (
                <>
                  <VpcsBreadcrumb project={project} />
                  {fifthPathItem === 'routers' && <VpcRouterBreadcrumb project={project} />}
                </>
              )}
              {thirdPathItem === 'floating-ips' && (
                <Breadcrumb to={pb.floatingIps({ project })} label="Floating IPs" />
              )}
              {thirdPathItem === 'access' && (
                <Breadcrumb to={pb.projectAccess({ project })} label="Access" />
              )}
            </>
          )}
        </>
      )}
      {firstPathItem === 'images' && (
        <Breadcrumb to={pb.siloImages()} label="Silo Images" includeSeparator={false} />
      )}
      {firstPathItem === 'utilization' && (
        <Breadcrumb
          to={pb.siloUtilization()}
          label="Silo Utilization"
          includeSeparator={false}
        />
      )}
      {firstPathItem === 'access' && (
        <Breadcrumb to={pb.siloAccess()} label="Silo Access" includeSeparator={false} />
      )}

      {/* System page breadcrumbs */}
      {firstPathItem === 'system' && (
        <>
          {secondPathItem === 'silos' && <SilosBreadcrumb />}
          {secondPathItem === 'utilization' && (
            <Breadcrumb
              to={pb.systemUtilization()}
              label="Utilization"
              includeSeparator={false}
            />
          )}
          {secondPathItem === 'inventory' && (
            <>
              <Breadcrumb to={pb.inventory()} label="Inventory" includeSeparator={false} />
              {thirdPathItem === 'sleds' && <SystemSledInventoryBreadcrumb />}
              {thirdPathItem === 'disks' && (
                <Breadcrumb to={pb.diskInventory()} label="Disks" />
              )}
            </>
          )}
          {thirdPathItem === 'ip-pools' && <SystemIpPoolsBreadcrumb />}
        </>
      )}
    </nav>
  )
}

type BreadcrumbProps = {
  to: string
  label: string
  includeSeparator?: boolean
}
export const Breadcrumb = ({ to, label, includeSeparator = true }: BreadcrumbProps) => (
  <>
    {includeSeparator && <Slash />}
    <Link
      to={to}
      className="ox-breadcrumb whitespace-nowrap text-sans-md text-secondary hover:text-default"
    >
      {label}
    </Link>
  </>
)

const InstanceBreadcrumb = ({ project }: { project: string }) => {
  const { instance } = useParams()
  return (
    <>
      <Breadcrumb to={pb.instances({ project })} label="Instances" />
      {instance && <Breadcrumb to={pb.instance({ project, instance })} label={instance} />}
    </>
  )
}

const VpcsBreadcrumb = ({ project }: { project: string }) => {
  const { vpc } = useParams()
  return (
    <>
      <Breadcrumb to={pb.vpcs({ project })} label="VPCs" />
      {vpc && <Breadcrumb to={pb.vpc({ project, vpc })} label={vpc} />}
    </>
  )
}

const VpcRouterBreadcrumb = ({ project }: { project: string }) => {
  const { vpc, router } = useParams()
  return (
    <>
      {vpc && <Breadcrumb to={pb.vpcRouters({ project, vpc })} label="Routers" />}
      {vpc && router && (
        <Breadcrumb to={pb.vpcRouter({ project, vpc, router })} label={router} />
      )}
    </>
  )
}

const SilosBreadcrumb = () => {
  const { silo } = useParams()
  return (
    <>
      <Breadcrumb to={pb.silos()} label="Silos" includeSeparator={false} />
      {silo && <Breadcrumb to={pb.silo({ silo })} label={silo} />}
    </>
  )
}

const SystemSledInventoryBreadcrumb = () => {
  const { sledId } = useParams()
  return (
    <>
      <Breadcrumb to={pb.sledInventory()} label="Sleds" />
      {sledId && <Breadcrumb to={pb.sled({ sledId })} label={sledId} />}
    </>
  )
}

const SystemIpPoolsBreadcrumb = () => {
  const { pool } = useParams()
  return (
    <>
      <Breadcrumb to={pb.ipPools()} label="IP Pools" includeSeparator={false} />
      {pool && <Breadcrumb to={pb.ipPool({ pool })} label={pool} />}
    </>
  )
}
