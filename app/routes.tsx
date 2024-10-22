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
import { EditIpPoolSideModalForm } from './forms/ip-pool-edit'
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
import type { CrumbFunc } from './hooks/use-title'
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
import { ProjectAccessPage } from './pages/project/access/ProjectAccessPage'
import { DisksPage } from './pages/project/disks/DisksPage'
import { FloatingIpsPage } from './pages/project/floating-ips/FloatingIpsPage'
import { ImagesPage } from './pages/project/images/ImagesPage'
import { InstancePage } from './pages/project/instances/instance/InstancePage'
import { SerialConsolePage } from './pages/project/instances/instance/SerialConsolePage'
import { ConnectTab } from './pages/project/instances/instance/tabs/ConnectTab'
import { MetricsTab } from './pages/project/instances/instance/tabs/MetricsTab'
import { NetworkingTab } from './pages/project/instances/instance/tabs/NetworkingTab'
import { StorageTab } from './pages/project/instances/instance/tabs/StorageTab'
import { InstancesPage } from './pages/project/instances/InstancesPage'
import { SnapshotsPage } from './pages/project/snapshots/SnapshotsPage'
import { InternetGatewayPage } from './pages/project/vpcs/InternetGatewayPage/InternetGatewayPage'
import { InternetGatewayIpAddressesTab } from './pages/project/vpcs/InternetGatewayPage/tabs/InternetGatewayIpAddressesTab'
import { InternetGatewayIpPoolsTab } from './pages/project/vpcs/InternetGatewayPage/tabs/InternetGatewayIpPoolsTab'
import { RouterPage } from './pages/project/vpcs/RouterPage'
import { VpcFirewallRulesTab } from './pages/project/vpcs/VpcPage/tabs/VpcFirewallRulesTab'
import { VpcInternetGatewaysTab } from './pages/project/vpcs/VpcPage/tabs/VpcGatewaysTab'
import { VpcRoutersTab } from './pages/project/vpcs/VpcPage/tabs/VpcRoutersTab'
import { VpcSubnetsTab } from './pages/project/vpcs/VpcPage/tabs/VpcSubnetsTab'
import { VpcPage } from './pages/project/vpcs/VpcPage/VpcPage'
import { VpcsPage } from './pages/project/vpcs/VpcsPage'
import { ProjectsPage } from './pages/ProjectsPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'
import { SiloAccessPage } from './pages/SiloAccessPage'
import { SiloUtilizationPage } from './pages/SiloUtilizationPage'
import { DisksTab } from './pages/system/inventory/DisksTab'
import { InventoryPage } from './pages/system/inventory/InventoryPage'
import { SledInstancesTab } from './pages/system/inventory/sled/SledInstancesTab'
import { SledPage } from './pages/system/inventory/sled/SledPage'
import { SledsTab } from './pages/system/inventory/SledsTab'
import { IpPoolPage } from './pages/system/networking/IpPoolPage'
import { IpPoolsPage } from './pages/system/networking/IpPoolsPage'
import { SiloImagesPage } from './pages/system/SiloImagesPage'
import { SiloPage } from './pages/system/silos/SiloPage'
import { SilosPage } from './pages/system/silos/SilosPage'
import { SystemUtilizationPage } from './pages/system/UtilizationPage'
import { pb } from './util/path-builder'

const projectCrumb: CrumbFunc = (m) => m.params.project!
const instanceCrumb: CrumbFunc = (m) => m.params.instance!
const vpcCrumb: CrumbFunc = (m) => m.params.vpc!
const internetGatewayCrumb: CrumbFunc = (m) => m.params.gateway!
const siloCrumb: CrumbFunc = (m) => m.params.silo!
const poolCrumb: CrumbFunc = (m) => m.params.pool!

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
      <Route path="settings" handle={{ crumb: 'settings' }} element={<SettingsLayout />}>
        <Route path="profile" element={<ProfilePage />} handle={{ crumb: 'Profile' }} />
        <Route element={<SSHKeysPage />} loader={SSHKeysPage.loader}>
          <Route path="ssh-keys" handle={{ crumb: 'SSH Keys' }} element={null} />
          <Route
            path="ssh-keys-new"
            element={<CreateSSHKeySideModalForm />}
            handle={{ crumb: 'New SSH key' }}
          />
        </Route>
      </Route>

      <Route path="system" element={<SystemLayout />} loader={SystemLayout.loader}>
        <Route
          element={<SilosPage />}
          loader={SilosPage.loader}
          handle={{ crumb: 'Silos' }}
        >
          <Route path="silos" element={null} />
          <Route path="silos-new" element={<CreateSiloSideModalForm />} />
        </Route>
        <Route path="silos" handle={{ crumb: 'Silos' }}>
          <Route
            path=":silo"
            element={<SiloPage />}
            loader={SiloPage.loader}
            handle={{ crumb: siloCrumb }}
          >
            <Route path="idps-new" element={<CreateIdpSideModalForm />} />
            <Route
              path="idps/saml/:provider"
              element={<EditIdpSideModalForm />}
              loader={EditIdpSideModalForm.loader}
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
          handle={{ crumb: 'Inventory' }}
        >
          <Route index element={<Navigate to="sleds" replace />} loader={SledsTab.loader} />
          <Route path="sleds" element={<SledsTab />} loader={SledsTab.loader} />
          <Route path="disks" element={<DisksTab />} loader={DisksTab.loader} />
        </Route>
        <Route
          path="inventory/sleds/:sledId"
          element={<SledPage />}
          loader={SledPage.loader}
          handle={{ crumb: 'Sleds' }}
        >
          <Route
            index
            element={<Navigate to="instances" replace />}
            loader={SledInstancesTab.loader}
          />
          <Route
            path="instances"
            element={<SledInstancesTab />}
            loader={SledInstancesTab.loader}
          />
        </Route>
        <Route path="health" element={null} handle={{ crumb: 'Health' }} />
        <Route path="update" element={null} handle={{ crumb: 'Update' }} />
        <Route path="networking">
          <Route index element={<Navigate to="ip-pools" replace />} />
          <Route
            element={<IpPoolsPage />}
            loader={IpPoolsPage.loader}
            handle={{ crumb: 'IP pools' }}
          >
            <Route path="ip-pools" element={null} />
            <Route path="ip-pools-new" element={<CreateIpPoolSideModalForm />} />
          </Route>
        </Route>
        <Route path="networking/ip-pools" handle={{ crumb: 'IP pools' }}>
          <Route
            path=":pool"
            element={<IpPoolPage />}
            loader={IpPoolPage.loader}
            handle={{ crumb: poolCrumb }}
          >
            <Route
              path="edit"
              element={<EditIpPoolSideModalForm />}
              loader={EditIpPoolSideModalForm.loader}
              handle={{ crumb: 'Edit IP pool' }}
            />
            <Route path="ranges-add" element={<IpPoolAddRangeSideModalForm />} />
          </Route>
        </Route>
      </Route>

      <Route index element={<Navigate to={pb.projects()} replace />} />

      {/* These are done here instead of nested so we don't flash a layout on 404s */}
      <Route path="projects/:project" element={<Navigate to="instances" replace />} />

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
            handle={{ crumb: 'Edit Image' }}
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

        <Route loader={ProjectsPage.loader} element={<ProjectsPage />}>
          <Route path="projects" handle={{ crumb: 'Projects' }} element={null} />
          <Route
            path="projects-new"
            element={<CreateProjectSideModalForm />}
            handle={{ crumb: 'New project' }}
          />
          <Route
            path="projects/:project/edit"
            element={<EditProjectSideModalForm />}
            loader={EditProjectSideModalForm.loader}
            handle={{ crumb: 'Edit project' }}
          />
        </Route>
        <Route
          path="access"
          element={<SiloAccessPage />}
          loader={SiloAccessPage.loader}
          handle={{ crumb: 'Access' }}
        />
      </Route>

      {/* PROJECT */}

      {/* Serial console page gets its own little section here because it
            cannot use the normal <ContentPane>.*/}
      <Route
        path="projects/:project"
        element={<ProjectLayout overrideContentPane={<SerialConsoleContentPane />} />}
        loader={ProjectLayout.loader}
        handle={{ crumb: projectCrumb }}
      >
        <Route path="instances" handle={{ crumb: 'Instances' }}>
          <Route path=":instance" handle={{ crumb: instanceCrumb }}>
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
        path="projects/:project"
        element={<ProjectLayout />}
        loader={ProjectLayout.loader}
        handle={{ crumb: projectCrumb }}
      >
        <Route
          path="instances-new"
          element={<CreateInstanceForm />}
          loader={CreateInstanceForm.loader}
          handle={{ crumb: 'New instance' }}
        />
        <Route path="instances" handle={{ crumb: 'Instances' }}>
          <Route index element={<InstancesPage />} loader={InstancesPage.loader} />
          <Route path=":instance" handle={{ crumb: instanceCrumb }}>
            <Route index element={<Navigate to="storage" replace />} />
            <Route element={<InstancePage />} loader={InstancePage.loader}>
              <Route
                path="storage"
                element={<StorageTab />}
                loader={StorageTab.loader}
                handle={{ crumb: 'Storage' }}
              />
              <Route
                path="networking"
                element={<NetworkingTab />}
                loader={NetworkingTab.loader}
                handle={{ crumb: 'Networking' }}
              />
              <Route
                path="metrics"
                element={<MetricsTab />}
                loader={MetricsTab.loader}
                handle={{ crumb: 'metrics' }}
              />
              <Route
                path="connect"
                element={<ConnectTab />}
                loader={ConnectTab.loader}
                handle={{ crumb: 'Connect' }}
              />
            </Route>
          </Route>
        </Route>

        <Route loader={VpcsPage.loader} element={<VpcsPage />}>
          <Route path="vpcs" handle={{ crumb: 'VPCs' }} element={null} />
          <Route
            path="vpcs-new"
            element={<CreateVpcSideModalForm />}
            handle={{ crumb: 'New VPC' }}
          />
        </Route>

        <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
          <Route path=":vpc" handle={{ crumb: vpcCrumb }}>
            <Route element={<VpcPage />} loader={VpcPage.loader}>
              <Route
                index
                element={<Navigate to="firewall-rules" replace />}
                loader={VpcFirewallRulesTab.loader}
              />
              <Route element={<VpcFirewallRulesTab />} loader={VpcFirewallRulesTab.loader}>
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
                <Route
                  path="firewall-rules-new/:rule?"
                  element={<CreateFirewallRuleForm />}
                  loader={CreateFirewallRuleForm.loader}
                  handle={{ crumb: 'New Firewall Rule' }}
                />
                <Route
                  path="firewall-rules/:rule/edit"
                  element={<EditFirewallRuleForm />}
                  loader={EditFirewallRuleForm.loader}
                  handle={{ crumb: 'Edit Firewall Rule' }}
                />
              </Route>
              <Route element={<VpcSubnetsTab />} loader={VpcSubnetsTab.loader}>
                <Route path="subnets" handle={{ crumb: 'Subnets' }} />
                <Route
                  path="subnets-new"
                  element={<CreateSubnetForm />}
                  handle={{ crumb: 'New Subnet' }}
                />
                <Route
                  path="subnets/:subnet/edit"
                  element={<EditSubnetForm />}
                  loader={EditSubnetForm.loader}
                  handle={{ crumb: 'Edit Subnet' }}
                />
              </Route>
              <Route element={<VpcRoutersTab />} loader={VpcRoutersTab.loader}>
                <Route path="routers" handle={{ crumb: 'Routers' }} element={null}>
                  <Route
                    path=":router/edit"
                    element={<EditRouterSideModalForm />}
                    loader={EditRouterSideModalForm.loader}
                    handle={{ crumb: 'Edit Router' }}
                  />
                </Route>
                <Route
                  path="routers-new"
                  element={<CreateRouterSideModalForm />}
                  handle={{ crumb: 'New Router' }}
                />
              </Route>
              <Route
                element={<VpcInternetGatewaysTab />}
                loader={VpcInternetGatewaysTab.loader}
              >
                <Route
                  path="internet-gateways"
                  handle={{ crumb: 'Internet gateways' }}
                  element={null}
                />
              </Route>
            </Route>
          </Route>
        </Route>
        <Route
          element={<RouterPage />}
          loader={RouterPage.loader}
          handle={{ crumb: 'Routes' }}
          path="vpcs/:vpc/routers/:router"
        >
          <Route
            path="routes-new"
            element={<CreateRouterRouteSideModalForm />}
            loader={CreateRouterRouteSideModalForm.loader}
            handle={{ crumb: 'New Route' }}
          />
          <Route
            path="routes/:route/edit"
            element={<EditRouterRouteSideModalForm />}
            loader={EditRouterRouteSideModalForm.loader}
            handle={{ crumb: 'Edit Route' }}
          />
        </Route>
        <Route
          path="vpcs/:vpc/internet-gateways/:gateway"
          handle={{ crumb: internetGatewayCrumb }}
        >
          <Route element={<InternetGatewayPage />} loader={InternetGatewayPage.loader}>
            <Route
              index
              element={<Navigate to="ip-pools" replace />}
              loader={InternetGatewayIpPoolsTab.loader}
            />
            <Route
              path="ip-pools"
              element={<InternetGatewayIpPoolsTab />}
              loader={InternetGatewayIpPoolsTab.loader}
              handle={{ crumb: 'IP Pools' }}
            />
            <Route
              path="ip-addresses"
              element={<InternetGatewayIpAddressesTab />}
              loader={InternetGatewayIpAddressesTab.loader}
              handle={{ crumb: 'IP Addresses' }}
            />
          </Route>
        </Route>
        <Route element={<FloatingIpsPage />} loader={FloatingIpsPage.loader}>
          <Route path="floating-ips" handle={{ crumb: 'Floating IPs' }} element={null} />
          <Route
            path="floating-ips-new"
            element={<CreateFloatingIpSideModalForm />}
            handle={{ crumb: 'New Floating IP' }}
          />
          <Route
            path="floating-ips/:floatingIp/edit"
            element={<EditFloatingIpSideModalForm />}
            loader={EditFloatingIpSideModalForm.loader}
            handle={{ crumb: 'Edit Floating IP' }}
          />
        </Route>

        <Route element={<DisksPage />} loader={DisksPage.loader}>
          <Route
            path="disks-new"
            element={
              // relative nav is allowed just this once because the route is
              // literally right there
              <CreateDiskSideModalForm onDismiss={(navigate) => navigate('../disks')} />
            }
            handle={{ crumb: 'New disk' }}
          />

          <Route path="disks" handle={{ crumb: 'Disks' }} element={null} />
        </Route>

        <Route element={<SnapshotsPage />} loader={SnapshotsPage.loader}>
          <Route path="snapshots" handle={{ crumb: 'Snapshots' }} element={null} />
          <Route
            path="snapshots-new"
            element={<CreateSnapshotSideModalForm />}
            handle={{ crumb: 'New snapshot' }}
          />
          <Route
            path="snapshots/:snapshot/images-new"
            element={<CreateImageFromSnapshotSideModalForm />}
            loader={CreateImageFromSnapshotSideModalForm.loader}
            handle={{ crumb: 'Create image from snapshot' }}
          />
        </Route>

        <Route element={<ImagesPage />} loader={ImagesPage.loader}>
          <Route path="images" handle={{ crumb: 'Images' }} element={null} />
          <Route
            path="images-new"
            handle={{ crumb: 'Upload image' }}
            element={<CreateImageSideModalForm />}
          />
          <Route
            path="images/:image/edit"
            element={<EditProjectImageSideModalForm />}
            loader={EditProjectImageSideModalForm.loader}
            handle={{ crumb: 'Edit Image' }}
          />
        </Route>
        <Route
          path="access"
          element={<ProjectAccessPage />}
          loader={ProjectAccessPage.loader}
          handle={{ crumb: 'Access' }}
        />
      </Route>
    </Route>
  </Route>
)
