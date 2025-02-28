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
import { makeCrumb, type Crumb } from './hooks/use-crumbs'
import { getInstanceSelector, getProjectSelector, getVpcSelector } from './hooks/use-params'
import * as ConnectTab from './pages/project/instances/ConnectTab'
import { InstancePage } from './pages/project/instances/InstancePage'
import * as NetworkingTab from './pages/project/instances/NetworkingTab'
import * as SettingsTab from './pages/project/instances/SettingsTab'
import * as StorageTab from './pages/project/instances/StorageTab'
import * as VpcRoutersTab from './pages/project/vpcs//VpcRoutersTab'
import { VpcPage } from './pages/project/vpcs/VpcPage'
import { VpcsPage } from './pages/project/vpcs/VpcsPage'
import * as DisksTab from './pages/system/inventory/DisksTab'
import { InventoryPage } from './pages/system/inventory/InventoryPage'
import * as SledInstances from './pages/system/inventory/sled/SledInstancesTab'
import * as SledPage from './pages/system/inventory/sled/SledPage'
import * as SledsTab from './pages/system/inventory/SledsTab'
import * as IpPool from './pages/system/networking/IpPoolPage'
import * as IpPools from './pages/system/networking/IpPoolsPage'
import * as SiloImages from './pages/system/SiloImagesPage'
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
          <Route
            path="ssh-keys-new"
            lazy={() => import('./pages/settings/ssh-key-create').then(convert)}
          />
        </Route>
      </Route>

      <Route path="system" lazy={() => import('./layouts/SystemLayout').then(convert)}>
        <Route lazy={() => import('./pages/system/silos/SilosPage').then(convert)}>
          <Route path="silos" element={null} />
          <Route
            path="silos-new"
            lazy={() => import('./forms/silo-create').then(convert)}
          />
        </Route>
        <Route path="silos" handle={{ crumb: 'Silos' }}>
          <Route
            path=":silo"
            lazy={() => import('./pages/system/silos/SiloPage').then(convert)}
          >
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
            <Route
              path="ip-pools-new"
              lazy={() => import('./forms/ip-pool-create').then(convert)}
            />
          </Route>
        </Route>
        <Route path="networking/ip-pools" handle={{ crumb: 'IP Pools' }}>
          <Route path=":pool" {...IpPool} handle={makeCrumb((p) => p.pool!)}>
            <Route path="edit" lazy={() => import('./forms/ip-pool-edit').then(convert)} />
            <Route
              path="ranges-add"
              lazy={() => import('./forms/ip-pool-range-add').then(convert)}
            />
          </Route>
        </Route>
      </Route>

      <Route index element={<Navigate to={pb.projects()} replace />} />

      <Route lazy={() => import('./layouts/SiloLayout').then(convert)}>
        <Route path="images" {...SiloImages} handle={{ crumb: 'Images' }}>
          <Route
            path=":image/edit"
            lazy={() => import('./pages/system/SiloImageEdit').then(convert)}
          />
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
        <Route lazy={() => import('./pages/ProjectsPage').then(convert)}>
          <Route path="projects" element={null} />
          <Route
            path="projects-new"
            lazy={() => import('./forms/project-create').then(convert)}
          />
          <Route
            path="projects/:project/edit"
            lazy={() => import('./forms/project-edit').then(convert)}
          />
        </Route>

        <Route path="access" lazy={() => import('./pages/SiloAccessPage').then(convert)} />
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
              lazy={() => import('./forms/vpc-create').then(convert)}
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
                  // janky one. we only want the loader. we'll have to make this
                  // its own file eventually. unfortunately the loader can't
                  // do redirect() with a replace
                  lazy={() =>
                    import('./pages/project/vpcs/VpcFirewallRulesTab')
                      .then(convert)
                      .then(({ loader }) => ({
                        loader,
                        Component: () => <Navigate to="firewall-rules" replace />,
                      }))
                  }
                />
                <Route
                  lazy={() =>
                    import('./pages/project/vpcs/VpcFirewallRulesTab').then(convert)
                  }
                >
                  <Route
                    path="edit"
                    lazy={() => import('./forms/vpc-edit').then(convert)}
                  />
                  <Route
                    path="firewall-rules"
                    element={null}
                    handle={{ crumb: 'Firewall Rules' }}
                  />
                  <Route element={null} handle={{ crumb: 'Firewall Rules' }}>
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
                <Route
                  lazy={() => import('./pages/project/vpcs/VpcSubnetsTab').then(convert)}
                >
                  <Route path="subnets" element={null} />
                  <Route
                    path="subnets-new"
                    lazy={() => import('./forms/subnet-create').then(convert)}
                  />
                  <Route
                    path="subnets/:subnet/edit"
                    lazy={() => import('./forms/subnet-edit').then(convert)}
                  />
                </Route>
                <Route {...VpcRoutersTab} handle={{ crumb: 'Routers' }}>
                  <Route path="routers" element={null}>
                    <Route
                      path=":router/edit"
                      lazy={() => import('./forms/vpc-router-edit').then(convert)}
                    />
                  </Route>
                  <Route
                    path="routers-new"
                    lazy={() => import('./forms/vpc-router-create').then(convert)}
                  />
                </Route>
                <Route
                  path="internet-gateways"
                  lazy={() => import('./pages/project/vpcs/VpcGatewaysTab').then(convert)}
                >
                  <Route
                    path=":gateway"
                    lazy={() =>
                      import('./pages/project/vpcs/internet-gateway-edit').then(convert)
                    }
                  />
                </Route>
              </Route>
            </Route>
          </Route>
          <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
            <Route path=":vpc" handle={makeCrumb((p) => p.vpc!)}>
              <Route path="routers" handle={{ crumb: 'Routers' }}>
                <Route
                  path=":router"
                  lazy={() => import('./pages/project/vpcs/RouterPage').then(convert)}
                >
                  <Route handle={{ crumb: 'Routes' }}>
                    <Route index element={null} />
                    <Route
                      path="routes-new"
                      lazy={() => import('./forms/vpc-router-route-create').then(convert)}
                    />
                    <Route
                      path="routes/:route/edit"
                      lazy={() => import('./forms/vpc-router-route-edit').then(convert)}
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
              lazy={() => import('./pages/project/disks/DiskCreate').then(convert)}
            />
          </Route>
          <Route
            lazy={() => import('./pages/project/snapshots/SnapshotsPage').then(convert)}
          >
            <Route path="snapshots" element={null} />
            <Route
              path="snapshots-new"
              lazy={() => import('./forms/snapshot-create').then(convert)}
            />
            <Route
              path="snapshots/:snapshot/images-new"
              lazy={() => import('./forms/image-from-snapshot').then(convert)}
            />
          </Route>
          <Route lazy={() => import('./pages/project/images/ImagesPage').then(convert)}>
            <Route path="images" element={null} />
            <Route
              path="images-new"
              lazy={() => import('./forms/image-upload').then(convert)}
            />
            <Route
              path="images/:image/edit"
              lazy={() => import('./pages/project/images/ProjectImageEdit').then(convert)}
            />
          </Route>
          <Route
            path="access"
            lazy={() => import('./pages/project/access/ProjectAccessPage').then(convert)}
          />
        </Route>
      </Route>
    </Route>
  </Route>
)
