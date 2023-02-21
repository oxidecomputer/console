import type { PathParamsV1 as PPv1 } from '@oxide/api'

// TODO: required versions of path params probably belong somewhere else,
// they're useful

type Org = Required<PPv1.Org>
type Project = Required<PPv1.Project>
type Instance = Required<PPv1.Instance>
type Vpc = Required<PPv1.Vpc>
type SystemUpdate = Required<PPv1.SystemUpdate>
type Silo = Required<PPv1.Silo>

// TODO: obviously the plan is pb2 becomes pb
export const pb2 = {
  orgs: () => '/orgs',
  orgNew: () => '/orgs-new',
  org: ({ organization }: Org) => `${pb2.orgs()}/${organization}`,
  orgEdit: (params: Org) => `${pb2.org(params)}/edit`,
  orgAccess: (params: Org) => `${pb2.org(params)}/access`,

  projects: (params: Org) => `${pb2.org(params)}/projects`,
  projectNew: (params: Org) => `${pb2.org(params)}/projects-new`,
  project: ({ organization, project }: Project) =>
    `${pb2.projects({ organization })}/${project}`,
  projectEdit: (params: Project) => `${pb2.project(params)}/edit`,

  projectAccess: (params: Project) => `${pb2.project(params)}/access`,
  projectImages: (params: Project) => `${pb2.project(params)}/images`,

  instances: (params: Project) => `${pb2.project(params)}/instances`,
  instanceNew: (params: Project) => `${pb2.project(params)}/instances-new`,
  instance: (params: Instance) => `${pb2.instances(params)}/${params.instance}`,

  /**
   * This route exists as a direct link to the default tab of the instance page. Unfortunately
   * we don't currently have a good mechanism at the moment to handle a redirect to the default
   * tab in a seemless way so we need all in-app links to go directly to the default tab.
   *
   * @see https://github.com/oxidecomputer/console/pull/1267#discussion_r1016766205
   */
  instancePage: (params: Instance) => pb2.instanceStorage(params),

  instanceMetrics: (params: Instance) => `${pb2.instance(params)}/metrics`,
  instanceStorage: (params: Instance) => `${pb2.instance(params)}/storage`,

  nics: (params: Instance) => `${pb2.instance(params)}/network-interfaces`,

  serialConsole: (params: Instance) => `${pb2.instance(params)}/serial-console`,

  diskNew: (params: Project) => `${pb2.project(params)}/disks-new`,
  disks: (params: Project) => `${pb2.project(params)}/disks`,

  snapshotNew: (params: Project) => `${pb2.project(params)}/snapshots-new`,
  snapshots: (params: Project) => `${pb2.project(params)}/snapshots`,

  vpcNew: (params: Project) => `${pb2.project(params)}/vpcs-new`,
  vpcs: (params: Project) => `${pb2.project(params)}/vpcs`,
  vpc: (params: Vpc) => `${pb2.vpcs(params)}/${params.vpc}`,
  vpcEdit: (params: Vpc) => `${pb2.vpc(params)}/edit`,

  siloUtilization: () => '/utilization',
  siloAccess: () => '/access',

  system: () => '/sys',
  systemIssues: () => '/sys/issues',
  systemUtilization: () => '/sys/utilization',
  systemHealth: () => '/sys/health',

  systemUpdates: () => '/sys/update/updates',
  systemUpdateDetail: ({ version }: SystemUpdate) => `${pb2.systemUpdates()}/${version}`,
  systemUpdateHistory: () => '/sys/update/history',
  updateableComponents: () => '/sys/update/components',

  systemNetworking: () => '/sys/networking',
  systemSettings: () => '/sys/settings',

  rackInventory: () => '/sys/inventory/racks',
  sledInventory: () => '/sys/inventory/sleds',
  diskInventory: () => '/sys/inventory/disks',

  silos: () => '/sys/silos',
  siloNew: () => '/sys/silos-new',
  silo: ({ silo }: Silo) => `/sys/silos/${silo}`,
  siloIdpNew: (params: Silo) => `${pb2.silo(params)}/idps-new`,

  settings: () => '/settings',
  profile: () => '/settings/profile',
  sshKeys: () => '/settings/ssh-keys',
  sshKeyNew: () => '/settings/ssh-keys-new',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
