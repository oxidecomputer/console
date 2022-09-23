import type { PathParams as PP } from '@oxide/api'

export const pb = {
  orgs: () => '/orgs',
  orgNew: () => '/org-new',
  org: ({ orgName }: PP.Org) => `${pb.orgs()}/${orgName}`,
  orgEdit: (params: PP.Org) => `${pb.org(params)}/edit`,
  orgAccess: (params: PP.Org) => `${pb.org(params)}/access`,

  projects: (params: PP.Org) => `${pb.org(params)}/projects`,
  projectNew: (params: PP.Org) => `${pb.org(params)}/project-new`,
  project: ({ orgName, projectName }: PP.Project) =>
    `${pb.projects({ orgName })}/${projectName}`,
  projectEdit: (params: PP.Project) => `${pb.project(params)}/edit`,

  access: (params: PP.Project) => `${pb.project(params)}/access`,
  snapshots: (params: PP.Project) => `${pb.project(params)}/snapshots`,
  images: (params: PP.Project) => `${pb.project(params)}/images`,

  instances: (params: PP.Project) => `${pb.project(params)}/instances`,
  instanceNew: (params: PP.Project) => `${pb.project(params)}/instance-new`,
  instance: (params: PP.Instance) => `${pb.instances(params)}/${params.instanceName}`,
  serialConsole: (params: PP.Instance) => `${pb.instance(params)}/serial-console`,

  diskNew: (params: PP.Project) => `${pb.project(params)}/disk-new`,
  disks: (params: PP.Project) => `${pb.project(params)}/disks`,
  vpcNew: (params: PP.Project) => `${pb.project(params)}/vpc-new`,

  vpcs: (params: PP.Project) => `${pb.project(params)}/vpcs`,
  vpc: (params: PP.Vpc) => `${pb.vpcs(params)}/${params.vpcName}`,
  vpcEdit: (params: PP.Vpc) => `${pb.vpc(params)}/edit`,

  system: () => '/system',
  systemIssues: () => '/system/issues',
  systemUtilization: () => '/system/utilization',
  systemInventory: () => '/system/inventory',
  systemHealth: () => '/system/health',
  systemUpdate: () => '/system/update',
  systemNetworking: () => '/system/networking',
  systemSettings: () => '/system/settings',

  silos: () => '/system/silos',
  siloNew: () => '/system/silo-new',
  silo: ({ siloName }: PP.Silo) => `/system/silos/${siloName}`,

  settings: () => '/settings',
  profile: () => '/settings/profile',
  appearance: () => '/settings/appearance',
  hotkeys: () => '/settings/hotkeys',
  sshKeys: () => '/settings/ssh-keys',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
