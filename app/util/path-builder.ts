import type { PathParams as PP } from '@oxide/api'

export const pb = {
  orgs: () => '/orgs',
  orgNew: () => '/orgs-new',
  org: ({ orgName }: PP.Org) => `${pb.orgs()}/${orgName}`,
  orgEdit: (params: PP.Org) => `${pb.org(params)}/edit`,
  orgAccess: (params: PP.Org) => `${pb.org(params)}/access`,

  projects: (params: PP.Org) => `${pb.org(params)}/projects`,
  projectNew: (params: PP.Org) => `${pb.org(params)}/projects-new`,
  project: ({ orgName, projectName }: PP.Project) =>
    `${pb.projects({ orgName })}/${projectName}`,
  projectEdit: (params: PP.Project) => `${pb.project(params)}/edit`,

  projectAccess: (params: PP.Project) => `${pb.project(params)}/access`,
  projectImages: (params: PP.Project) => `${pb.project(params)}/images`,

  instances: (params: PP.Project) => `${pb.project(params)}/instances`,
  instanceNew: (params: PP.Project) => `${pb.project(params)}/instances-new`,
  instance: (params: PP.Instance) => `${pb.instances(params)}/${params.instanceName}`,

  /**
   * This route exists as a direct link to the default tab of the instance page. Unfortunately
   * we don't currently have a good mechanism at the moment to handle a redirect to the default
   * tab in a seemless way so we need all in-app links to go directly to the default tab.
   *
   * @see https://github.com/oxidecomputer/console/pull/1267#discussion_r1016766205
   */
  instancePage: (params: PP.Instance) => pb.instanceStorage(params),

  instanceMetrics: (params: PP.Instance) => `${pb.instance(params)}/metrics`,
  instanceStorage: (params: PP.Instance) => `${pb.instance(params)}/storage`,

  nics: (params: PP.Instance) => `${pb.instance(params)}/network-interfaces`,

  serialConsole: (params: PP.Instance) => `${pb.instance(params)}/serial-console`,

  diskNew: (params: PP.Project) => `${pb.project(params)}/disks-new`,
  disks: (params: PP.Project) => `${pb.project(params)}/disks`,

  snapshotNew: (params: PP.Project) => `${pb.project(params)}/snapshots-new`,
  snapshots: (params: PP.Project) => `${pb.project(params)}/snapshots`,

  vpcNew: (params: PP.Project) => `${pb.project(params)}/vpcs-new`,
  vpcs: (params: PP.Project) => `${pb.project(params)}/vpcs`,
  vpc: (params: PP.Vpc) => `${pb.vpcs(params)}/${params.vpcName}`,
  vpcEdit: (params: PP.Vpc) => `${pb.vpc(params)}/edit`,

  siloUtilization: () => '/utilization',
  siloAccess: () => '/access',

  system: () => '/sys',
  systemIssues: () => '/sys/issues',
  systemUtilization: () => '/sys/utilization',
  systemHealth: () => '/sys/health',

  systemUpdates: () => '/sys/update/updates',
  systemUpdateDetail: (params: PP.SystemUpdate) =>
    `${pb.systemUpdates()}/${params.version}`,
  systemUpdateHistory: () => '/sys/update/history',
  updateableComponents: () => '/sys/update/components',

  systemNetworking: () => '/sys/networking',
  systemSettings: () => '/sys/settings',

  rackInventory: () => '/sys/inventory/racks',
  sledInventory: () => '/sys/inventory/sleds',
  diskInventory: () => '/sys/inventory/disks',

  silos: () => '/sys/silos',
  siloNew: () => '/sys/silos-new',
  silo: ({ siloName }: PP.Silo) => `/sys/silos/${siloName}`,
  siloIdpNew: (params: PP.Silo) => `${pb.silo(params)}/idps-new`,

  settings: () => '/settings',
  profile: () => '/settings/profile',
  sshKeys: () => '/settings/ssh-keys',
  sshKeyNew: () => '/settings/ssh-keys-new',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
