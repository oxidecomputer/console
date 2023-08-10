/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Navigate, Route, createRoutesFromElements } from 'react-router-dom'

import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import { NotFound } from './components/ErrorPage'
import { CreateDiskSideModalForm } from './forms/disk-create'
import { CreateIdpSideModalForm } from './forms/idp/create'
import { EditIdpSideModalForm } from './forms/idp/edit'
import {
  EditProjectImageSideModalForm,
  EditSiloImageSideModalForm,
} from './forms/image-edit'
import { CreateImageFromSnapshotSideModalForm } from './forms/image-from-snapshot'
import { CreateImageSideModalForm } from './forms/image-upload'
import { CreateInstanceForm } from './forms/instance-create'
import { CreateProjectSideModalForm } from './forms/project-create'
import { EditProjectSideModalForm } from './forms/project-edit'
import { CreateSiloSideModalForm } from './forms/silo-create'
import { CreateSnapshotSideModalForm } from './forms/snapshot-create'
import { CreateSSHKeySideModalForm } from './forms/ssh-key-create'
import { CreateVpcSideModalForm } from './forms/vpc-create'
import { EditVpcSideModalForm } from './forms/vpc-edit'
import type { CrumbFunc } from './hooks/use-crumbs'
import AuthLayout from './layouts/AuthLayout'
import { LoginLayout } from './layouts/LoginLayout'
import ProjectLayout from './layouts/ProjectLayout'
import RootLayout from './layouts/RootLayout'
import SettingsLayout from './layouts/SettingsLayout'
import { SiloLayout } from './layouts/SiloLayout'
import SystemLayout from './layouts/SystemLayout'
import { SerialConsoleContentPane, currentUserLoader } from './layouts/helpers'
import DeviceAuthSuccessPage from './pages/DeviceAuthSuccessPage'
import DeviceAuthVerifyPage from './pages/DeviceAuthVerifyPage'
import { LoginPage } from './pages/LoginPage'
import { LoginPageSaml } from './pages/LoginPageSaml'
import ProjectsPage from './pages/ProjectsPage'
import { SiloAccessPage } from './pages/SiloAccessPage'
import { SiloUtilizationPage } from './pages/SiloUtilizationPage'
import {
  DisksPage,
  ImagesPage,
  InstancePage,
  InstancesPage,
  ProjectAccessPage,
  SnapshotsPage,
  VpcPage,
  VpcsPage,
} from './pages/project'
import { SerialConsolePage } from './pages/project/instances/instance/SerialConsolePage'
import { ConnectTab } from './pages/project/instances/instance/tabs/ConnectTab'
import { MetricsTab } from './pages/project/instances/instance/tabs/MetricsTab'
import { NetworkingTab } from './pages/project/instances/instance/tabs/NetworkingTab'
import { StorageTab } from './pages/project/instances/instance/tabs/StorageTab'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'
import { CapacityUtilizationPage } from './pages/system/CapacityUtilizationPage'
import { SiloImagesPage } from './pages/system/SiloImagesPage'
import { SiloPage } from './pages/system/SiloPage'
import SilosPage from './pages/system/SilosPage'
import { DisksTab } from './pages/system/inventory/DisksTab'
import { InventoryPage } from './pages/system/inventory/InventoryPage'
import { SledsTab } from './pages/system/inventory/SledsTab'
import { SledInstancesTab } from './pages/system/inventory/sled/SledInstancesTab'
import { SledPage } from './pages/system/inventory/sled/SledPage'
import { pb } from './util/path-builder'

const projectCrumb: CrumbFunc = (m) => m.params.project!
const instanceCrumb: CrumbFunc = (m) => m.params.instance!
const vpcCrumb: CrumbFunc = (m) => m.params.vpc!
const siloCrumb: CrumbFunc = (m) => m.params.silo!

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
      loader={currentUserLoader}
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
            <Route index element={null} />
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
          element={<CapacityUtilizationPage />}
          loader={CapacityUtilizationPage.loader}
          handle={{ crumb: 'Utilization' }}
        />
        <Route
          path="inventory"
          element={<InventoryPage />}
          loader={InventoryPage.loader}
          handle={{ crumb: 'Inventory' }}
        >
          <Route path="sleds" element={<SledsTab />} loader={SledsTab.loader} />
          <Route path="disks" element={<DisksTab />} loader={DisksTab.loader} />
        </Route>
        <Route
          path="inventory/sleds/:sledId"
          element={<SledPage />}
          loader={SledPage.loader}
          handle={{ crumb: 'Sleds' }}
        >
          <Route index element={<Navigate to="instances" replace />} />
          <Route
            path="instances"
            element={<SledInstancesTab />}
            loader={SledInstancesTab.loader}
          />
        </Route>
        <Route path="health" element={null} handle={{ crumb: 'Health' }} />
        <Route path="update" element={null} handle={{ crumb: 'Update' }} />
        <Route path="networking" element={null} handle={{ crumb: 'Networking' }} />
        <Route path="settings" element={null} handle={{ crumb: 'Settings' }} />
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
          handle={{ crumb: 'Access & IAM' }}
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
                path="network-interfaces"
                element={<NetworkingTab />}
                loader={NetworkingTab.loader}
                handle={{ crumb: 'Network interfaces' }}
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
          <Route
            path="vpcs/:vpc/edit"
            element={<EditVpcSideModalForm />}
            loader={EditVpcSideModalForm.loader}
            handle={{ crumb: 'Edit VPC' }}
          />
        </Route>

        <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
          <Route
            path=":vpc"
            element={<VpcPage />}
            loader={VpcPage.loader}
            handle={{ crumb: vpcCrumb }}
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
            path="snapshots/:snapshot/image-new"
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
          handle={{ crumb: 'Access & IAM' }}
        />
      </Route>
    </Route>
  </Route>
)
