/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactElement } from 'react'
import {
  createRoutesFromElements,
  Navigate,
  Route,
  type LoaderFunctionArgs,
  type redirect,
} from 'react-router'

import { NotFound } from './components/ErrorPage'
import { CreateDiskSideModalForm } from './forms/disk-create'
import { ProjectImageEdit, SiloImageEdit } from './forms/image-edit'
import { CreateImageFromSnapshotSideModalForm } from './forms/image-from-snapshot'
import * as ImageCreate from './forms/image-upload'
import { CreateIpPoolSideModalForm } from './forms/ip-pool-create'
import * as IpPoolEdit from './forms/ip-pool-edit'
import * as IpPoolAddRange from './forms/ip-pool-range-add'
import * as ProjectCreate from './forms/project-create'
import { EditProjectSideModalForm } from './forms/project-edit'
import * as SnapshotCreate from './forms/snapshot-create'
import * as SSHKeyCreate from './forms/ssh-key-create'
import { CreateSubnetForm } from './forms/subnet-create'
import { EditSubnetForm } from './forms/subnet-edit'
import { CreateVpcSideModalForm } from './forms/vpc-create'
import * as RouterCreate from './forms/vpc-router-create'
import { EditRouterSideModalForm } from './forms/vpc-router-edit'
import { CreateRouterRouteSideModalForm } from './forms/vpc-router-route-create'
import { EditRouterRouteSideModalForm } from './forms/vpc-router-route-edit'
import { makeCrumb, titleCrumb, type Crumb } from './hooks/use-crumbs'
import { getInstanceSelector, getProjectSelector, getVpcSelector } from './hooks/use-params'
import * as ProjectAccess from './pages/project/access/ProjectAccessPage'
import { ImagesPage } from './pages/project/images/ImagesPage'
import * as ConnectTab from './pages/project/instances/ConnectTab'
import { InstancePage } from './pages/project/instances/InstancePage'
import * as NetworkingTab from './pages/project/instances/NetworkingTab'
import * as SettingsTab from './pages/project/instances/SettingsTab'
import * as StorageTab from './pages/project/instances/StorageTab'
import { SnapshotsPage } from './pages/project/snapshots/SnapshotsPage'
import * as VpcRoutersTab from './pages/project/vpcs//VpcRoutersTab'
import { EditInternetGatewayForm } from './pages/project/vpcs/internet-gateway-edit'
import * as RouterPage from './pages/project/vpcs/RouterPage'
import { VpcFirewallRulesTab } from './pages/project/vpcs/VpcFirewallRulesTab'
import { VpcInternetGatewaysTab } from './pages/project/vpcs/VpcGatewaysTab'
import { VpcPage } from './pages/project/vpcs/VpcPage'
import { VpcsPage } from './pages/project/vpcs/VpcsPage'
import * as VpcSubnetsTab from './pages/project/vpcs/VpcSubnetsTab'
import * as Projects from './pages/ProjectsPage'
import * as SiloAccess from './pages/SiloAccessPage'
import * as DisksTab from './pages/system/inventory/DisksTab'
import { InventoryPage } from './pages/system/inventory/InventoryPage'
import * as SledInstances from './pages/system/inventory/sled/SledInstancesTab'
import * as SledPage from './pages/system/inventory/sled/SledPage'
import * as SledsTab from './pages/system/inventory/SledsTab'
import * as IpPool from './pages/system/networking/IpPoolPage'
import * as IpPools from './pages/system/networking/IpPoolsPage'
import * as SiloImages from './pages/system/SiloImagesPage'
import * as SiloPage from './pages/system/silos/SiloPage'
import * as SilosPage from './pages/system/silos/SilosPage'
import { truncate } from './ui/lib/Truncate'
import { pb } from './util/path-builder'

// hack because RR doesn't export the redirect type
type Redirect = ReturnType<typeof redirect>

type RouteModule = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  clientLoader?: (a: LoaderFunctionArgs<any>) => Promise<Redirect | null>
  default: () => ReactElement | null
  shouldRevalidate?: () => boolean
  ErrorBoundary?: () => ReactElement
  handle?: Crumb
  // trick to get a nice type error when we forget to convert loader to
  // clientLoader in the module
  loader?: never
  Component?: never
}

function convert(m: RouteModule) {
  const { clientLoader, default: Component, ...rest } = m
  return { ...rest, loader: clientLoader, Component }
}

export const routes = createRoutesFromElements(
  <Route lazy={() => import('./layouts/RootLayout').then(convert)}>
    <Route path="*" element={<NotFound />} />
    <Route lazy={() => import('./layouts/LoginLayout.tsx').then(convert)}>
      <Route
        path="login/:silo/local"
        lazy={() => import('./pages/LoginPage').then(convert)}
      />
      <Route
        path="login/:silo/saml/:provider"
        lazy={() => import('./pages/LoginPageSaml').then(convert)}
      />
    </Route>

    <Route path="device" lazy={() => import('./layouts/AuthLayout').then(convert)}>
      <Route
        path="verify"
        lazy={() => import('./pages/DeviceAuthVerifyPage').then(convert)}
      />
      <Route
        path="success"
        lazy={() => import('./pages/DeviceAuthSuccessPage').then(convert)}
      />
    </Route>

    {/* This wraps all routes that are supposed to be authenticated */}
    <Route lazy={() => import('./layouts/AuthenticatedLayout').then(convert)}>
      <Route path="settings" lazy={() => import('./layouts/SettingsLayout').then(convert)}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route
          path="profile"
          lazy={() => import('./pages/settings/ProfilePage').then(convert)}
        />
        <Route lazy={() => import('./pages/settings/SSHKeysPage').then(convert)}>
          <Route path="ssh-keys" element={null}>
            <Route
              path=":sshKey/edit"
              lazy={() => import('./forms/ssh-key-edit').then(convert)}
            />
          </Route>
          <Route path="ssh-keys-new" {...SSHKeyCreate} handle={titleCrumb('New SSH key')} />
        </Route>
      </Route>

      <Route path="system" lazy={() => import('./layouts/SystemLayout').then(convert)}>
        <Route {...SilosPage} handle={makeCrumb('Silos', pb.silos())}>
          <Route path="silos" element={null} />
          <Route
            path="silos-new"
            lazy={() => import('./forms/silo-create').then(convert)}
          />
        </Route>
        <Route path="silos" handle={{ crumb: 'Silos' }}>
          <Route path=":silo" {...SiloPage} handle={makeCrumb((p) => p.silo!)}>
            <Route
              path="idps-new"
              lazy={() => import('./forms/idp/create').then(convert)}
            />
            <Route
              path="idps/saml/:provider"
              lazy={() => import('./forms/idp/edit').then(convert)}
            />
          </Route>
        </Route>
        <Route path="issues" element={null} />
        <Route
          path="utilization"
          lazy={() => import('./pages/system/UtilizationPage').then(convert)}
        />
        <Route
          path="inventory"
          element={<InventoryPage />}
          loader={InventoryPage.loader}
          handle={makeCrumb('Inventory', pb.sledInventory())}
        >
          <Route index element={<Navigate to="sleds" replace />} loader={SledsTab.loader} />
          <Route path="sleds" {...SledsTab} handle={{ crumb: 'Sleds' }} />
          <Route path="disks" {...DisksTab} handle={{ crumb: 'Disks' }} />
        </Route>
        <Route path="inventory" handle={{ crumb: 'Inventory' }}>
          <Route path="sleds" handle={{ crumb: 'Sleds' }}>
            {/* a crumb for the sled ID looks ridiculous, unfortunately */}
            <Route
              path=":sledId"
              {...SledPage}
              handle={makeCrumb(
                (p) => truncate(p.sledId!, 12, 'middle'),
                (p) => pb.sled({ sledId: p.sledId! })
              )}
            >
              <Route
                index
                element={<Navigate to="instances" replace />}
                loader={SledInstances.loader}
              />
              <Route path="instances" handle={{ crumb: 'Instances' }} {...SledInstances} />
            </Route>
          </Route>
        </Route>
        <Route path="networking">
          <Route index element={<Navigate to="ip-pools" replace />} />
          <Route {...IpPools} handle={{ crumb: 'IP Pools' }}>
            <Route path="ip-pools" element={null} />
            <Route path="ip-pools-new" element={<CreateIpPoolSideModalForm />} />
          </Route>
        </Route>
        <Route path="networking/ip-pools" handle={{ crumb: 'IP Pools' }}>
          <Route path=":pool" {...IpPool} handle={makeCrumb((p) => p.pool!)}>
            <Route path="edit" {...IpPoolEdit} handle={{ crumb: 'Edit IP pool' }} />
            <Route path="ranges-add" {...IpPoolAddRange} handle={titleCrumb('Add Range')} />
          </Route>
        </Route>
      </Route>

      <Route index element={<Navigate to={pb.projects()} replace />} />

      <Route lazy={() => import('./layouts/SiloLayout').then(convert)}>
        <Route path="images" {...SiloImages} handle={{ crumb: 'Images' }}>
          <Route path=":image/edit" {...SiloImageEdit} handle={titleCrumb('Edit Image')} />
        </Route>
        <Route
          path="utilization"
          lazy={() => import('./pages/SiloUtilizationPage').then(convert)}
        />

        {/* let's do both. what could go wrong*/}
        <Route
          path="lookup/instances/:instance"
          lazy={() => import('./pages/InstanceLookup.tsx').then(convert)}
        />
        <Route
          path="lookup/i/:instance"
          lazy={() => import('./pages/InstanceLookup.tsx').then(convert)}
        />

        {/* these are here instead of under projects because they need to use SiloLayout */}
        <Route {...Projects} handle={makeCrumb('Projects', pb.projects())}>
          <Route path="projects" element={null} />
          <Route
            path="projects-new"
            {...ProjectCreate}
            handle={titleCrumb('New project')}
          />
          <Route
            path="projects/:project/edit"
            element={<EditProjectSideModalForm />}
            loader={EditProjectSideModalForm.loader}
            handle={titleCrumb('Edit project')}
          />
        </Route>

        <Route path="access" {...SiloAccess} handle={{ crumb: 'Access' }} />
      </Route>

      {/* PROJECT */}

      <Route path="projects" handle={{ crumb: 'Projects' }}>
        {/* Serial console page gets its own little section here because it
              cannot use the normal <ContentPane>.*/}
        <Route
          path=":project"
          lazy={() => import('./layouts/SerialConsoleLayout').then(convert)}
        >
          <Route path="instances" handle={{ crumb: 'Instances' }}>
            <Route path=":instance" handle={makeCrumb((p) => p.instance!)}>
              <Route
                path="serial-console"
                lazy={() =>
                  import('./pages/project/instances/SerialConsolePage').then(convert)
                }
              />
            </Route>
          </Route>
        </Route>

        <Route path=":project" lazy={() => import('./layouts/ProjectLayout').then(convert)}>
          <Route index element={<Navigate to="instances" replace />} />
          <Route
            path="instances-new"
            lazy={() => import('./forms/instance-create').then(convert)}
          />
          <Route path="instances" handle={{ crumb: 'Instances' }}>
            <Route
              index
              lazy={() => import('./pages/project/instances/InstancesPage').then(convert)}
            />
            <Route
              path=":instance"
              handle={makeCrumb(
                (p) => p.instance!,
                (p) => pb.instance(getInstanceSelector(p))
              )}
            >
              <Route index element={<Navigate to="storage" replace />} />
              <Route element={<InstancePage />} loader={InstancePage.loader}>
                <Route {...StorageTab} path="storage" handle={{ crumb: 'Storage' }} />
                <Route
                  {...NetworkingTab}
                  path="networking"
                  handle={{ crumb: 'Networking' }}
                />
                <Route
                  path="metrics"
                  lazy={() => import('./pages/project/instances/MetricsTab').then(convert)}
                >
                  <Route index element={<Navigate to="cpu" replace />} />
                  <Route
                    lazy={() =>
                      import('./pages/project/instances/CpuMetricsTab').then(convert)
                    }
                    path="cpu"
                  />
                  <Route
                    lazy={() =>
                      import('./pages/project/instances/DiskMetricsTab').then(convert)
                    }
                    path="disk"
                  />
                  <Route
                    lazy={() =>
                      import('./pages/project/instances/NetworkMetricsTab').then(convert)
                    }
                    path="network"
                    handle={{ crumb: 'Network' }}
                  />
                </Route>
                <Route {...ConnectTab} path="connect" handle={{ crumb: 'Connect' }} />
                <Route {...SettingsTab} path="settings" handle={{ crumb: 'Settings' }} />
              </Route>
            </Route>
          </Route>
          <Route
            loader={VpcsPage.loader}
            handle={makeCrumb('VPCs', (p) => pb.vpcs(getProjectSelector(p)))}
            element={<VpcsPage />}
          >
            <Route path="vpcs" element={null} />
            <Route
              path="vpcs-new"
              element={<CreateVpcSideModalForm />}
              handle={titleCrumb('New VPC')}
            />
          </Route>
          <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
            <Route
              path=":vpc"
              handle={makeCrumb(
                (p) => p.vpc!,
                (p) => pb.vpc(getVpcSelector(p))
              )}
            >
              <Route element={<VpcPage />} loader={VpcPage.loader}>
                <Route
                  index
                  element={<Navigate to="firewall-rules" replace />}
                  loader={VpcFirewallRulesTab.loader}
                />
                <Route
                  element={<VpcFirewallRulesTab />}
                  loader={VpcFirewallRulesTab.loader}
                >
                  <Route
                    path="edit"
                    lazy={() => import('./forms/vpc-edit').then(convert)}
                  />
                  <Route
                    path="firewall-rules"
                    handle={{ crumb: 'Firewall Rules' }}
                    element={null}
                  />
                  <Route handle={{ crumb: 'Firewall Rules' }} element={null}>
                    <Route
                      path="firewall-rules-new/:rule?"
                      lazy={() => import('./forms/firewall-rules-create').then(convert)}
                    />
                    <Route
                      path="firewall-rules/:rule/edit"
                      lazy={() => import('./forms/firewall-rules-edit').then(convert)}
                    />
                  </Route>
                </Route>
                <Route {...VpcSubnetsTab} handle={{ crumb: 'Subnets' }}>
                  <Route path="subnets" element={null} />
                  <Route
                    path="subnets-new"
                    element={<CreateSubnetForm />}
                    handle={titleCrumb('New Subnet')}
                  />
                  <Route
                    path="subnets/:subnet/edit"
                    element={<EditSubnetForm />}
                    loader={EditSubnetForm.loader}
                    handle={titleCrumb('Edit Subnet')}
                  />
                </Route>
                <Route {...VpcRoutersTab} handle={{ crumb: 'Routers' }}>
                  <Route path="routers" element={null}>
                    <Route
                      path=":router/edit"
                      element={<EditRouterSideModalForm />}
                      loader={EditRouterSideModalForm.loader}
                      handle={titleCrumb('Edit Router')}
                    />
                  </Route>
                  <Route
                    path="routers-new"
                    {...RouterCreate}
                    handle={titleCrumb('New Router')}
                  />
                </Route>
                <Route
                  path="internet-gateways"
                  handle={{ crumb: 'Internet Gateways' }}
                  loader={VpcInternetGatewaysTab.loader}
                  element={<VpcInternetGatewaysTab />}
                >
                  <Route
                    path=":gateway"
                    element={<EditInternetGatewayForm />}
                    loader={EditInternetGatewayForm.loader}
                    handle={titleCrumb('Edit Internet Gateway')}
                  />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
            <Route path=":vpc" handle={makeCrumb((p) => p.vpc!)}>
              <Route path="routers" handle={{ crumb: 'Routers' }}>
                <Route path=":router" {...RouterPage} handle={makeCrumb((p) => p.router!)}>
                  <Route handle={{ crumb: 'Routes' }}>
                    <Route index element={null} />
                    <Route
                      path="routes-new"
                      element={<CreateRouterRouteSideModalForm />}
                      loader={CreateRouterRouteSideModalForm.loader}
                      handle={titleCrumb('New Route')}
                    />
                    <Route
                      path="routes/:route/edit"
                      element={<EditRouterRouteSideModalForm />}
                      loader={EditRouterRouteSideModalForm.loader}
                      handle={titleCrumb('Edit Route')}
                    />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
          <Route
            lazy={() =>
              import('./pages/project/floating-ips/FloatingIpsPage').then(convert)
            }
          >
            <Route path="floating-ips" element={null} />
            <Route
              path="floating-ips-new"
              lazy={() => import('./forms/floating-ip-create').then(convert)}
            />
            <Route
              path="floating-ips/:floatingIp/edit"
              lazy={() => import('./forms/floating-ip-edit').then(convert)}
            />
          </Route>
          <Route lazy={() => import('./pages/project/disks/DisksPage').then(convert)}>
            <Route path="disks" element={null} />
            <Route
              path="disks-new"
              element={
                // relative nav is allowed just this once because the route is
                // literally right there
                <CreateDiskSideModalForm onDismiss={(navigate) => navigate('../disks')} />
              }
              handle={titleCrumb('New disk')}
            />
          </Route>
          <Route
            element={<SnapshotsPage />}
            handle={makeCrumb('Snapshots', (p) => pb.snapshots(getProjectSelector(p)))}
            loader={SnapshotsPage.loader}
          >
            <Route path="snapshots" element={null} />
            <Route
              path="snapshots-new"
              {...SnapshotCreate}
              handle={titleCrumb('New snapshot')}
            />
            <Route
              path="snapshots/:snapshot/images-new"
              element={<CreateImageFromSnapshotSideModalForm />}
              loader={CreateImageFromSnapshotSideModalForm.loader}
              handle={titleCrumb('Create image from snapshot')}
            />
          </Route>
          <Route
            element={<ImagesPage />}
            handle={makeCrumb('Images', (p) => pb.projectImages(getProjectSelector(p)))}
            loader={ImagesPage.loader}
          >
            <Route path="images" element={null} />
            <Route path="images-new" {...ImageCreate} handle={titleCrumb('Upload image')} />
            <Route
              path="images/:image/edit"
              {...ProjectImageEdit}
              handle={titleCrumb('Edit Image')}
            />
          </Route>
          <Route path="access" {...ProjectAccess} handle={{ crumb: 'Access' }} />
        </Route>
      </Route>
    </Route>
  </Route>
)
