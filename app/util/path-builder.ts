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

  instanceMetrics: (params: PP.Instance) =>
    `${pb.instances(params)}/${params.instanceName}/metrics`,
  instanceStorage: (params: PP.Instance) =>
    `${pb.instances(params)}/${params.instanceName}/storage`,

  nics: (params: PP.Instance) =>
    `${pb.instances(params)}/${params.instanceName}/network-interfaces`,

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
  systemInventory: () => '/sys/inventory',
  systemHealth: () => '/sys/health',
  systemUpdate: () => '/sys/update',
  systemNetworking: () => '/sys/networking',
  systemSettings: () => '/sys/settings',

  silos: () => '/sys/silos',
  siloNew: () => '/sys/silos-new',
  silo: ({ siloName }: PP.Silo) => `/sys/silos/${siloName}`,

  settings: () => '/settings',
  profile: () => '/settings/profile',
  appearance: () => '/settings/appearance',
  hotkeys: () => '/settings/hotkeys',
  sshKeys: () => '/settings/ssh-keys',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
