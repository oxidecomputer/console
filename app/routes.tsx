import { Navigate, Route, createRoutesFromElements } from 'react-router-dom'

import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import { CreateDiskSideModalForm } from './forms/disk-create'
import { CreateIdpSideModalForm } from './forms/idp-create'
import { CreateInstanceForm } from './forms/instance-create'
import { CreateOrgSideModalForm } from './forms/org-create'
import { EditOrgSideModalForm } from './forms/org-edit'
import { CreateProjectSideModalForm } from './forms/project-create'
import { EditProjectSideModalForm } from './forms/project-edit'
import { CreateSiloSideModalForm } from './forms/silo-create'
import { CreateSnapshotSideModalForm } from './forms/snapshot-create'
import { CreateSSHKeySideModalForm } from './forms/ssh-key-create'
import { CreateVpcSideModalForm } from './forms/vpc-create'
import { EditVpcSideModalForm } from './forms/vpc-edit'
import type { CrumbFunc } from './hooks/use-crumbs'
import AuthLayout from './layouts/AuthLayout'
import OrgLayout from './layouts/OrgLayout'
import ProjectLayout from './layouts/ProjectLayout'
import RootLayout from './layouts/RootLayout'
import SettingsLayout from './layouts/SettingsLayout'
import SiloLayout from './layouts/SiloLayout'
import SystemLayout from './layouts/SystemLayout'
import { userLoader } from './layouts/helpers'
import DeviceAuthSuccessPage from './pages/DeviceAuthSuccessPage'
import DeviceAuthVerifyPage from './pages/DeviceAuthVerifyPage'
import LoginPage from './pages/LoginPage'
import NotFound from './pages/NotFound'
import { OrgAccessPage } from './pages/OrgAccessPage'
import OrgsPage from './pages/OrgsPage'
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
import { MetricsTab } from './pages/project/instances/instance/tabs/MetricsTab'
import { NetworkingTab } from './pages/project/instances/instance/tabs/NetworkingTab'
import { SerialConsoleTab } from './pages/project/instances/instance/tabs/SerialConsoleTab'
import { StorageTab } from './pages/project/instances/instance/tabs/StorageTab'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'
import { CapacityUtilizationPage } from './pages/system/CapacityUtilizationPage'
import { DisksTab } from './pages/system/InventoryPage/DisksTab'
import { InventoryPage } from './pages/system/InventoryPage/InventoryPage'
import { RacksTab } from './pages/system/InventoryPage/RacksTab'
import { SledsTab } from './pages/system/InventoryPage/SledsTab'
import { SiloPage } from './pages/system/SiloPage'
import SilosPage from './pages/system/SilosPage'
import { UpdateDetailSideModal } from './pages/system/UpdateDetailSideModal'
import {
  UpdatePage,
  UpdatePageComponents,
  UpdatePageHistory,
  UpdatePageUpdates,
} from './pages/system/UpdatePage'
import { pb } from './util/path-builder'

const orgCrumb: CrumbFunc = (m) => m.params.orgName!
const projectCrumb: CrumbFunc = (m) => m.params.projectName!
const instanceCrumb: CrumbFunc = (m) => m.params.instanceName!
const vpcCrumb: CrumbFunc = (m) => m.params.vpcName!

export const routes = createRoutesFromElements(
  <Route element={<RootLayout />}>
    <Route path="*" element={<NotFound />} />
    <Route path="spoof_login" element={<AuthLayout />}>
      <Route index element={<LoginPage />} />
    </Route>

    <Route path="device" element={<AuthLayout />}>
      <Route path="verify" element={<DeviceAuthVerifyPage />} />
      <Route path="success" element={<DeviceAuthSuccessPage />} />
    </Route>

    {/* This wraps all routes that are supposed to be authenticated */}
    <Route loader={userLoader} errorElement={<RouterDataErrorBoundary />}>
      <Route path="settings" handle={{ crumb: 'settings' }} element={<SettingsLayout />}>
        <Route index element={<Navigate to="profile" replace />} />
        <Route path="profile" element={<ProfilePage />} handle={{ crumb: 'Profile' }} />
        <Route element={<SSHKeysPage />} loader={SSHKeysPage.loader}>
          <Route path="ssh-keys" handle={{ crumb: 'SSH Keys' }} />
          <Route
            path="ssh-keys-new"
            element={<CreateSSHKeySideModalForm />}
            handle={{ crumb: 'New SSH key' }}
          />
        </Route>
      </Route>

      <Route path="sys" element={<SystemLayout />} loader={SystemLayout.loader}>
        <Route element={<SilosPage />} loader={SilosPage.loader}>
          <Route path="silos" />
          <Route path="silos-new" element={<CreateSiloSideModalForm />} />
        </Route>
        <Route path="silos/:siloName" element={<SiloPage />} loader={SiloPage.loader}>
          <Route index />
          <Route path="idps-new" element={<CreateIdpSideModalForm />} />
        </Route>
        <Route path="issues" element={null} />
        <Route
          path="utilization"
          element={<CapacityUtilizationPage />}
          loader={CapacityUtilizationPage.loader}
        />
        <Route path="inventory" element={<InventoryPage />}>
          <Route index element={<Navigate to="racks" replace />} />
          <Route path="racks" element={<RacksTab />} loader={RacksTab.loader} />
          <Route path="sleds" element={<SledsTab />} loader={SledsTab.loader} />
          <Route path="disks" element={<DisksTab />} loader={DisksTab.loader} />
        </Route>
        <Route path="health" element={null} />
        <Route path="update" element={<UpdatePage />} loader={UpdatePage.loader}>
          <Route index element={<Navigate to="updates" replace />} />
          <Route
            path="updates"
            element={<UpdatePageUpdates />}
            loader={UpdatePageUpdates.loader}
          >
            <Route
              path=":version"
              element={<UpdateDetailSideModal />}
              loader={UpdateDetailSideModal.loader}
            />
          </Route>
          <Route path="components" element={<UpdatePageComponents />} />
          <Route
            path="history"
            element={<UpdatePageHistory />}
            loader={UpdatePageHistory.loader}
          />
        </Route>
        <Route path="networking" element={null} />
        <Route path="settings" element={null} />
      </Route>

      <Route index element={<Navigate to={pb.orgs()} replace />} />

      {/* These are done here instead of nested so we don't flash a layout on 404s */}
      <Route path="orgs/:orgName" element={<Navigate to="projects" replace />} />
      <Route
        path="orgs/:orgName/projects/:projectName"
        element={<Navigate to="instances" replace />}
      />

      <Route element={<SiloLayout />}>
        <Route
          path="utilization"
          element={<SiloUtilizationPage />}
          loader={SiloUtilizationPage.loader}
        />
        <Route element={<OrgsPage />} loader={OrgsPage.loader}>
          <Route path="orgs" handle={{ crumb: 'Orgs' }} />
          <Route
            path="orgs-new"
            element={<CreateOrgSideModalForm />}
            handle={{ crumb: 'New org' }}
          />
          <Route
            path="orgs/:orgName/edit"
            element={<EditOrgSideModalForm />}
            loader={EditOrgSideModalForm.loader}
            handle={{ crumb: 'Edit org' }}
          />
        </Route>
        <Route
          path="access"
          element={<SiloAccessPage />}
          loader={SiloAccessPage.loader}
          handle={{ crumb: 'Access & IAM' }}
        />
      </Route>

      <Route path="orgs/:orgName" handle={{ crumb: orgCrumb }}>
        <Route element={<OrgLayout />}>
          <Route
            path="access"
            element={<OrgAccessPage />}
            loader={OrgAccessPage.loader}
            handle={{ crumb: 'Access & IAM' }}
          />

          <Route loader={ProjectsPage.loader} element={<ProjectsPage />}>
            <Route path="projects" handle={{ crumb: 'Projects' }} />
            <Route
              path="projects-new"
              element={<CreateProjectSideModalForm />}
              handle={{ crumb: 'New project' }}
            />
            <Route
              path="projects/:projectName/edit"
              element={<EditProjectSideModalForm />}
              loader={EditProjectSideModalForm.loader}
              handle={{ crumb: 'Edit project' }}
            />
          </Route>
        </Route>

        {/* PROJECT */}
        <Route
          path="projects/:projectName"
          element={<ProjectLayout />}
          handle={{ crumb: projectCrumb }}
        >
          <Route
            path="instances-new"
            element={<CreateInstanceForm />}
            loader={CreateInstanceForm.loader}
            handle={{ crumb: 'New instance' }}
          />
          <Route
            path="instances/:instanceName"
            element={<Navigate to="storage" replace />}
          />
          <Route path="instances" handle={{ crumb: 'Instances' }}>
            <Route index element={<InstancesPage />} loader={InstancesPage.loader} />
            <Route path=":instanceName" handle={{ crumb: instanceCrumb }}>
              <Route element={<InstancePage />} loader={InstancePage.loader}>
                <Route
                  path="storage"
                  element={<StorageTab />}
                  handle={{ crumb: 'storage' }}
                />
                <Route
                  path="network-interfaces"
                  element={<NetworkingTab />}
                  handle={{ crumb: 'network-interfaces' }}
                />
                <Route
                  path="metrics"
                  element={<MetricsTab />}
                  loader={MetricsTab.loader}
                  handle={{ crumb: 'metrics' }}
                />
                <Route
                  path="serial-console"
                  element={<SerialConsoleTab />}
                  handle={{ crumb: 'serial-console' }}
                />
              </Route>
            </Route>
          </Route>

          <Route loader={VpcsPage.loader} element={<VpcsPage />}>
            <Route path="vpcs" handle={{ crumb: 'VPCs' }} />
            <Route
              path="vpcs-new"
              element={<CreateVpcSideModalForm />}
              handle={{ crumb: 'New VPC' }}
            />
            <Route
              path="vpcs/:vpcName/edit"
              element={<EditVpcSideModalForm />}
              loader={EditVpcSideModalForm.loader}
              handle={{ crumb: 'Edit VPC' }}
            />
          </Route>

          <Route path="vpcs" handle={{ crumb: 'VPCs' }}>
            <Route
              path=":vpcName"
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

            <Route path="disks" handle={{ crumb: 'Disks' }} />
          </Route>

          <Route element={<SnapshotsPage />} loader={SnapshotsPage.loader}>
            <Route path="snapshots" handle={{ crumb: 'Snapshots' }} />
            <Route
              path="snapshots-new"
              element={<CreateSnapshotSideModalForm />}
              handle={{ crumb: 'New snapshot' }}
            />
          </Route>

          <Route
            path="images"
            element={<ImagesPage />}
            loader={ImagesPage.loader}
            handle={{ crumb: 'Images' }}
          />
          <Route
            path="access"
            element={<ProjectAccessPage />}
            loader={ProjectAccessPage.loader}
            handle={{ crumb: 'Access & IAM' }}
          />
        </Route>
      </Route>
    </Route>
  </Route>
)
