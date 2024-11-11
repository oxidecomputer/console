/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { createRoutesFromElements, Navigate, Route } from 'react-router-dom'

import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './components/ErrorPage'
import { CreateDiskSideModalForm } from './forms/disk-create'
import { CreateFirewallRuleForm } from './forms/firewall-rules-create'
import { EditFirewallRuleForm } from './forms/firewall-rules-edit'
import { CreateFloatingIpSideModalForm } from './forms/floating-ip-create'
import { EditFloatingIpSideModalForm } from './forms/floating-ip-edit'
import { CreateIdpSideModalForm } from './forms/idp/create'
import { EditIdpSideModalForm } from './forms/idp/edit'
import {
  EditProjectImageSideModalForm,
  EditSiloImageSideModalForm,
} from './forms/image-edit'
import { CreateImageFromSnapshotSideModalForm } from './forms/image-from-snapshot'
import { CreateImageSideModalForm } from './forms/image-upload'
import { CreateInstanceForm } from './forms/instance-create'
import { CreateIpPoolSideModalForm } from './forms/ip-pool-create'
import * as IpPoolEdit from './forms/ip-pool-edit'
import { IpPoolAddRangeSideModalForm } from './forms/ip-pool-range-add'
import { CreateProjectSideModalForm } from './forms/project-create'
import { EditProjectSideModalForm } from './forms/project-edit'
import { CreateSiloSideModalForm } from './forms/silo-create'
import { CreateSnapshotSideModalForm } from './forms/snapshot-create'
import { CreateSSHKeySideModalForm } from './forms/ssh-key-create'
import { CreateSubnetForm } from './forms/subnet-create'
import { EditSubnetForm } from './forms/subnet-edit'
import { CreateVpcSideModalForm } from './forms/vpc-create'
import { EditVpcSideModalForm } from './forms/vpc-edit'
import { CreateRouterSideModalForm } from './forms/vpc-router-create'
import { EditRouterSideModalForm } from './forms/vpc-router-edit'
import { CreateRouterRouteSideModalForm } from './forms/vpc-router-route-create'
import { EditRouterRouteSideModalForm } from './forms/vpc-router-route-edit'
import { makeCrumb } from './hooks/use-crumbs'
import { getInstanceSelector, getProjectSelector, getVpcSelector } from './hooks/use-params'
import { AuthenticatedLayout } from './layouts/AuthenticatedLayout'
import { AuthLayout } from './layouts/AuthLayout'
import { SerialConsoleContentPane } from './layouts/helpers'
import { LoginLayout } from './layouts/LoginLayout'
import { ProjectLayout } from './layouts/ProjectLayout'
import { RootLayout } from './layouts/RootLayout'
import { SettingsLayout } from './layouts/SettingsLayout'
import { SiloLayout } from './layouts/SiloLayout'
import { SystemLayout } from './layouts/SystemLayout'
import { DeviceAuthSuccessPage } from './pages/DeviceAuthSuccessPage'
import { DeviceAuthVerifyPage } from './pages/DeviceAuthVerifyPage'
import { LoginPage } from './pages/LoginPage'
import { LoginPageSaml } from './pages/LoginPageSaml'
import { instanceLookupLoader } from './pages/lookups'
import * as ProjectAccess from './pages/project/access/ProjectAccessPage'
import { DisksPage } from './pages/project/disks/DisksPage'
import { FloatingIpsPage } from './pages/project/floating-ips/FloatingIpsPage'
import { ImagesPage } from './pages/project/images/ImagesPage'
import { InstancePage } from './pages/project/instances/instance/InstancePage'
import { SerialConsolePage } from './pages/project/instances/instance/SerialConsolePage'
import * as ConnectTab from './pages/project/instances/instance/tabs/ConnectTab'
import * as MetricsTab from './pages/project/instances/instance/tabs/MetricsTab'
import * as NetworkingTab from './pages/project/instances/instance/tabs/NetworkingTab'
import * as StorageTab from './pages/project/instances/instance/tabs/StorageTab'
import { InstancesPage } from './pages/project/instances/InstancesPage'
import { SnapshotsPage } from './pages/project/snapshots/SnapshotsPage'
import * as RouterPage from './pages/project/vpcs/RouterPage'
import { VpcFirewallRulesTab } from './pages/project/vpcs/VpcPage/tabs/VpcFirewallRulesTab'
import { VpcRoutersTab } from './pages/project/vpcs/VpcPage/tabs/VpcRoutersTab'
import { VpcSubnetsTab } from './pages/project/vpcs/VpcPage/tabs/VpcSubnetsTab'
import { VpcPage } from './pages/project/vpcs/VpcPage/VpcPage'
import { VpcsPage } from './pages/project/vpcs/VpcsPage'
import * as Projects from './pages/ProjectsPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import * as SSHKeysPage from './pages/settings/SSHKeysPage'
import * as SiloAccess from './pages/SiloAccessPage'
import { SiloUtilizationPage } from './pages/SiloUtilizationPage'
import * as DisksTab from './pages/system/inventory/DisksTab'
import { InventoryPage } from './pages/system/inventory/InventoryPage'
import { SledInstancesTab } from './pages/system/inventory/sled/SledInstancesTab'
import { SledPage } from './pages/system/inventory/sled/SledPage'
import * as SledsTab from './pages/system/inventory/SledsTab'
import * as IpPool from './pages/system/networking/IpPoolPage'
import * as IpPools from './pages/system/networking/IpPoolsPage'
import { SiloImagesPage } from './pages/system/SiloImagesPage'
import * as SiloPage from './pages/system/silos/SiloPage'
import * as SilosPage from './pages/system/silos/SilosPage'
import { SystemUtilizationPage } from './pages/system/UtilizationPage'
import { pb } from './util/path-builder'

export const routes = createRoutesFromElements(
  <Route element={<RootLayout />}>
    <Route path="*" element={<NotFound />} />
    <Route element={<LoginLayout />}>
      <Route path="login/:silo/local" element={<LoginPage />} />
      <Route path="login/:silo/saml/:provider" element={<LoginPageSaml />} />
    </Route>

    <Route path="device" element={<AuthLayout />}>
      <Route path="verify" element={<DeviceAuthVerifyPage />} />
      <Route path="success" element={<DeviceAuthSuccessPage />} />
    </Route>

    {/* This wraps all routes that are supposed to be authenticated */}
    <Route
      element={<AuthenticatedLayout />}
      loader={AuthenticatedLayout.loader}
      errorElement={<RouterDataErrorBoundary />}
      // very important. see `currentUserLoader` and `useCurrentUser`
      shouldRevalidate={() => true}
    >
      <Route
        path="settings"
        handle={makeCrumb('Settings', pb.profile())}
        element={<SettingsLayout />}
      >
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} handle={{ crumb: 'Profile' }} />
        <Route {...SSHKeysPage} handle={makeCrumb('SSH Keys', pb.sshKeys)}>
          <Route path="ssh-keys" element={null} />
          <Route
            path="ssh-keys-new"
            element={<CreateSSHKeySideModalForm />}
            handle={{ crumb: 'New SSH key', titleOnly: true }}
          />
        </Route>
      </Route>

      <Route path="system" element={<SystemLayout />} loader={SystemLayout.loader}>
        <Route {...SilosPage} handle={makeCrumb('Silos', pb.silos())}>
          <Route path="silos" element={null} />
          <Route path="silos-new" element={<CreateSiloSideModalForm />} />
        </Route>
        <Route path="silos" handle={{ crumb: 'Silos' }}>
          <Route path=":silo" {...SiloPage} handle={makeCrumb((p) => p.silo!)}>
            <Route path="idps-new" element={<CreateIdpSideModalForm />} />
            <Route
              path="idps/saml/:provider"
              element={<EditIdpSideModalForm />}
              loader={EditIdpSideModalForm.loader}
              handle={{ crumb: 'Edit Identity Provider', titleOnly: true }}
            />
          </Route>
        </Route>
        <Route path="issues" element={null} />
        <Route
          path="utilization"
          element={<SystemUtilizationPage />}
          loader={SystemUtilizationPage.loader}
          handle={{ crumb: 'Utilization' }}
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
            <Route path=":sledId" element={<SledPage />} loader={SledPage.loader}>
              <Route
                index
                element={<Navigate to="instances" replace />}
                loader={SledInstancesTab.loader}
              />
              <Route
                path="instances"
                handle={{ crumb: 'Instances' }}
                element={<SledInstancesTab />}
                loader={SledInstancesTab.loader}
              />
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
            <Route
              path="ranges-add"
              element={<IpPoolAddRangeSideModalForm />}
              handle={{ crumb: 'Add Range', titleOnly: true }}
            />
          </Route>
        </Route>
      </Route>

      <Route index element={<Navigate to={pb.projects()} replace />} />

      <Route element={<SiloLayout />}>
        <Route
          path="images"
          element={<SiloImagesPage />}
          loader={SiloImagesPage.loader}
          handle={{ crumb: 'Images' }}
        >
          <Route
            path=":image/edit"
            element={<EditSiloImageSideModalForm />}
            loader={EditSiloImageSideModalForm.loader}
            handle={{ crumb: 'Edit Image', titleOnly: true }}
          />
        </Route>
        <Route
          path="utilization"
          element={<SiloUtilizationPage />}
          loader={SiloUtilizationPage.loader}
          handle={{ crumb: 'Utilization' }}
        />

        {/* let's do both. what could go wrong*/}
        <Route
          path="lookup/instances/:instance"
          element={null}
          loader={instanceLookupLoader}
        />
        <Route path="lookup/i/:instance" element={null} loader={instanceLookupLoader} />

        {/* these are here instead of under projects because they need to use SiloLayout */}
        <Route {...Projects} handle={makeCrumb('Projects', pb.projects())}>
          <Route path="projects" element={null} />
          <Route
            path="projects-new"
            element={<CreateProjectSideModalForm />}
            handle={{ crumb: 'New project', titleOnly: true }}
          />
          <Route
            path="projects/:project/edit"
            element={<EditProjectSideModalForm />}
            loader={EditProjectSideModalForm.loader}
            handle={{ crumb: 'Edit project', titleOnly: true }}
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
          element={<ProjectLayout overrideContentPane={<SerialConsoleContentPane />} />}
          loader={ProjectLayout.loader}
          handle={makeCrumb(
            (p) => p.project!,
            (p) => pb.project(getProjectSelector(p))
          )}
        >
          <Route path="instances" handle={{ crumb: 'Instances' }}>
            <Route path=":instance" handle={makeCrumb((p) => p.instance!)}>
              <Route
                path="serial-console"
                loader={SerialConsolePage.loader}
                element={<SerialConsolePage />}
                handle={{ crumb: 'Serial Console' }}
              />
            </Route>
          </Route>
        </Route>

        <Route
          path=":project"
          element={<ProjectLayout />}
          loader={ProjectLayout.loader}
          handle={makeCrumb(
            (p) => p.project!,
            (p) => pb.project(getProjectSelector(p))
          )}
        >
          <Route index element={<Navigate to="instances" replace />} />
          <Route
            path="instances-new"
            element={<CreateInstanceForm />}
            loader={CreateInstanceForm.loader}
            handle={{ crumb: 'New instance' }}
          />
          <Route path="instances" handle={{ crumb: 'Instances' }}>
            <Route index element={<InstancesPage />} loader={InstancesPage.loader} />
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
                <Route {...MetricsTab} path="metrics" handle={{ crumb: 'Metrics' }} />
                <Route {...ConnectTab} path="connect" handle={{ crumb: 'Connect' }} />
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
              handle={{ crumb: 'New VPC', titleOnly: true }}
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
                    element={<EditVpcSideModalForm />}
                    loader={EditVpcSideModalForm.loader}
                    handle={{ crumb: 'Edit VPC' }}
                  />
                  <Route
                    path="firewall-rules"
                    handle={{ crumb: 'Firewall Rules' }}
                    element={null}
                  />
                  <Route handle={{ crumb: 'Firewall Rules' }} element={null}>
                    <Route
                      path="firewall-rules-new/:rule?"
                      element={<CreateFirewallRuleForm />}
                      loader={CreateFirewallRuleForm.loader}
                      handle={{ crumb: 'New Rule', titleOnly: true }}
                    />
                    <Route
                      path="firewall-rules/:rule/edit"
                      element={<EditFirewallRuleForm />}
                      loader={EditFirewallRuleForm.loader}
                      handle={{ crumb: 'Edit Rule', titleOnly: true }}
                    />
                  </Route>
                </Route>
                <Route
                  element={<VpcSubnetsTab />}
                  loader={VpcSubnetsTab.loader}
                  handle={{ crumb: 'Subnets' }}
                >
                  <Route path="subnets" element={null} />
                  <Route
                    path="subnets-new"
                    element={<CreateSubnetForm />}
                    handle={{ crumb: 'New Subnet', titleOnly: true }}
                  />
                  <Route
                    path="subnets/:subnet/edit"
                    element={<EditSubnetForm />}
                    loader={EditSubnetForm.loader}
                    handle={{ crumb: 'Edit Subnet', titleOnly: true }}
                  />
                </Route>
                <Route
                  element={<VpcRoutersTab />}
                  handle={{ crumb: 'Routers' }}
                  loader={VpcRoutersTab.loader}
                >
                  <Route path="routers" element={null}>
                    <Route
                      path=":router/edit"
                      element={<EditRouterSideModalForm />}
                      loader={EditRouterSideModalForm.loader}
                      handle={{ crumb: 'Edit Router', titleOnly: true }}
                    />
                  </Route>
                  <Route
                    path="routers-new"
                    element={<CreateRouterSideModalForm />}
                    handle={{ crumb: 'New Router', titleOnly: true }}
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
                    <Route index />
                    <Route
                      path="routes-new"
                      element={<CreateRouterRouteSideModalForm />}
                      loader={CreateRouterRouteSideModalForm.loader}
                      handle={{ crumb: 'New Route', titleOnly: true }}
                    />
                    <Route
                      path="routes/:route/edit"
                      element={<EditRouterRouteSideModalForm />}
                      loader={EditRouterRouteSideModalForm.loader}
                      handle={{ crumb: 'Edit Route', titleOnly: true }}
                    />
                  </Route>
                </Route>
              </Route>
            </Route>
          </Route>
          <Route
            element={<FloatingIpsPage />}
            loader={FloatingIpsPage.loader}
            handle={makeCrumb('Floating IPs', (p) => pb.floatingIps(getProjectSelector(p)))}
          >
            <Route path="floating-ips" element={null} />
            <Route
              path="floating-ips-new"
              element={<CreateFloatingIpSideModalForm />}
              handle={{ crumb: 'New Floating IP', titleOnly: true }}
            />
            <Route
              path="floating-ips/:floatingIp/edit"
              element={<EditFloatingIpSideModalForm />}
              loader={EditFloatingIpSideModalForm.loader}
              handle={{ crumb: 'Edit Floating IP', titleOnly: true }}
            />
          </Route>

          <Route
            element={<DisksPage />}
            handle={makeCrumb('Disks', (p) => pb.disks(getProjectSelector(p)))}
            loader={DisksPage.loader}
          >
            <Route path="disks" element={null} />
            <Route
              path="disks-new"
              element={
                // relative nav is allowed just this once because the route is
                // literally right there
                <CreateDiskSideModalForm onDismiss={(navigate) => navigate('../disks')} />
              }
              handle={{ crumb: 'New disk', titleOnly: true }}
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
              element={<CreateSnapshotSideModalForm />}
              handle={{ crumb: 'New snapshot', titleOnly: true }}
            />
            <Route
              path="snapshots/:snapshot/images-new"
              element={<CreateImageFromSnapshotSideModalForm />}
              loader={CreateImageFromSnapshotSideModalForm.loader}
              handle={{ crumb: 'Create image from snapshot', titleOnly: true }}
            />
          </Route>

          <Route
            element={<ImagesPage />}
            handle={makeCrumb('Images', (p) => pb.projectImages(getProjectSelector(p)))}
            loader={ImagesPage.loader}
          >
            <Route path="images" element={null} />
            <Route
              path="images-new"
              handle={{ crumb: 'Upload image', titleOnly: true }}
              element={<CreateImageSideModalForm />}
            />
            <Route
              path="images/:image/edit"
              element={<EditProjectImageSideModalForm />}
              loader={EditProjectImageSideModalForm.loader}
              handle={{ crumb: 'Edit Image', titleOnly: true }}
            />
          </Route>
          <Route path="access" {...ProjectAccess} handle={{ crumb: 'Access' }} />
        </Route>
      </Route>
    </Route>
  </Route>
)
