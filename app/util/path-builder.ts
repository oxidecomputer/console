import type { PathParams as PP } from '@oxide/api'

// TODO: required versions of path params probably belong somewhere else,
// they're useful

type Project = Required<PP.Project>
type Instance = Required<PP.Instance>
type Vpc = Required<PP.Vpc>
type SystemUpdate = Required<PP.SystemUpdate>
type Silo = Required<PP.Silo>
type IdentityProvider = Required<PP.IdentityProvider>
type Sled = Required<PP.Sled>
type Image = Required<PP.Image>
type SiloImage = Required<PP.SiloImage>

export const pb = {
  projects: () => `/projects`,
  projectNew: () => `/projects-new`,
  project: ({ project }: Project) => `${pb.projects()}/${project}`,
  projectEdit: (params: Project) => `${pb.project(params)}/edit`,

  projectAccess: (params: Project) => `${pb.project(params)}/access`,
  projectImages: (params: Project) => `${pb.project(params)}/images`,
  projectImageNew: (params: Project) => `${pb.project(params)}/images-new`,
  projectImage: (params: Image) => `${pb.projectImages(params)}/${params.image}`,
  projectImageEdit: (params: Image) => `${pb.projectImage(params)}/edit`,

  instances: (params: Project) => `${pb.project(params)}/instances`,
  instanceNew: (params: Project) => `${pb.project(params)}/instances-new`,
  instance: (params: Instance) => `${pb.instances(params)}/${params.instance}`,

  /**
   * This route exists as a direct link to the default tab of the instance page. Unfortunately
   * we don't currently have a good mechanism at the moment to handle a redirect to the default
   * tab in a seemless way so we need all in-app links to go directly to the default tab.
   *
   * @see https://github.com/oxidecomputer/console/pull/1267#discussion_r1016766205
   */
  instancePage: (params: Instance) => pb.instanceStorage(params),

  instanceMetrics: (params: Instance) => `${pb.instance(params)}/metrics`,
  instanceStorage: (params: Instance) => `${pb.instance(params)}/storage`,
  instanceConnect: (params: Instance) => `${pb.instance(params)}/connect`,

  nics: (params: Instance) => `${pb.instance(params)}/network-interfaces`,

  serialConsole: (params: Instance) => `${pb.instance(params)}/serial-console`,

  diskNew: (params: Project) => `${pb.project(params)}/disks-new`,
  disks: (params: Project) => `${pb.project(params)}/disks`,

  snapshotNew: (params: Project) => `${pb.project(params)}/snapshots-new`,
  snapshots: (params: Project) => `${pb.project(params)}/snapshots`,

  vpcNew: (params: Project) => `${pb.project(params)}/vpcs-new`,
  vpcs: (params: Project) => `${pb.project(params)}/vpcs`,
  vpc: (params: Vpc) => `${pb.vpcs(params)}/${params.vpc}`,
  vpcEdit: (params: Vpc) => `${pb.vpc(params)}/edit`,

  siloUtilization: () => '/utilization',
  siloAccess: () => '/access',
  siloImages: () => '/images',
  siloImage: (params: SiloImage) => `${pb.siloImages()}/${params.image}`,
  siloImageEdit: (params: SiloImage) => `${pb.siloImage(params)}/edit`,

  system: () => '/system',
  systemIssues: () => '/system/issues',
  systemUtilization: () => '/system/utilization',
  systemHealth: () => '/system/health',

  systemUpdates: () => '/system/update/updates',
  systemUpdateDetail: ({ version }: SystemUpdate) => `${pb.systemUpdates()}/${version}`,
  systemUpdateHistory: () => '/system/update/history',
  updateableComponents: () => '/system/update/components',

  systemNetworking: () => '/system/networking',
  systemSettings: () => '/system/settings',

  rackInventory: () => '/system/inventory/racks',
  sledInventory: () => '/system/inventory/sleds',
  diskInventory: () => '/system/inventory/disks',
  sled: ({ sledId }: Sled) => `/system/inventory/sleds/${sledId}`,
  sledInstances: ({ sledId }: Sled) => `/system/inventory/sleds/${sledId}/instances`,

  silos: () => '/system/silos',
  siloNew: () => '/system/silos-new',
  silo: ({ silo }: Silo) => `/system/silos/${silo}`,
  siloIdpNew: (params: Silo) => `${pb.silo(params)}/idps-new`,
  samlIdp: (params: IdentityProvider) => `${pb.silo(params)}/idps/saml/${params.provider}`,

  settings: () => '/settings',
  profile: () => '/settings/profile',
  sshKeys: () => '/settings/ssh-keys',
  sshKeyNew: () => '/settings/ssh-keys-new',

  deviceSuccess: () => '/device/success',
}

// export const jelly = 'just kidding'
