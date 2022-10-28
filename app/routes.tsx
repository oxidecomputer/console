import React from 'react'
import { Navigate, Route, createRoutesFromElements } from 'react-router-dom'

import { RouterDataErrorBoundary } from './components/ErrorBoundary'
import { CreateDiskSideModalForm } from './forms/disk-create'
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
import { InstanceCreatePage } from './pages/project/instances/InstanceCreatePage'
import { SerialConsolePage } from './pages/project/instances/instance/SerialConsolePage'
import { AppearancePage } from './pages/settings/AppearancePage'
import { HotkeysPage } from './pages/settings/HotkeysPage'
import { ProfilePage } from './pages/settings/ProfilePage'
import { SSHKeysPage } from './pages/settings/SSHKeysPage'
import SilosPage from './pages/system/SilosPage'
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
        <Route
          path="appearance"
          element={<AppearancePage />}
          handle={{ crumb: 'Appearance' }}
        />
        <Route element={<SSHKeysPage />} loader={SSHKeysPage.loader}>
          <Route path="ssh-keys" handle={{ crumb: 'SSH Keys' }} />
          <Route
            path="ssh-keys-new"
            element={<CreateSSHKeySideModalForm />}
            handle={{ crumb: 'New SSH key' }}
          />
        </Route>
        <Route path="hotkeys" element={<HotkeysPage />} handle={{ crumb: 'Hotkeys' }} />
      </Route>

      <Route path="sys" element={<SystemLayout />} loader={SystemLayout.loader}>
        <Route element={<SilosPage />} loader={SilosPage.loader}>
          <Route path="silos" />
          <Route path="silos-new" element={<CreateSiloSideModalForm />} />
        </Route>
        <Route path="issues" element={null} />
        <Route path="utilization" element={null} />
        <Route path="inventory" element={null} />
        <Route path="health" element={null} />
        <Route path="update" element={null} />
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
        <Route path="utilization" element={null} />
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
            element={<InstanceCreatePage />}
            handle={{ crumb: 'New instance' }}
          />
          <Route path="instances" handle={{ crumb: 'Instances' }}>
            <Route index element={<InstancesPage />} loader={InstancesPage.loader} />
            <Route path=":instanceName" handle={{ crumb: instanceCrumb }}>
              <Route index element={<InstancePage />} loader={InstancePage.loader} />
              <Route
                path="serial-console"
                element={<SerialConsolePage />}
                handle={{ crumb: 'serial-console' }}
              />
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
              // TODO: onDismiss here
              element={<CreateDiskSideModalForm onDismiss={() => {}} />}
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
