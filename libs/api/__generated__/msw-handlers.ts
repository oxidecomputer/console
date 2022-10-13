/* eslint-disable */
import {
  ResponseComposition,
  ResponseTransformer,
  RestContext,
  RestHandler,
  RestRequest,
  compose,
  context,
  rest,
} from 'msw'
import type { SnakeCasedPropertiesDeep as Snakify } from 'type-fest'
import { ZodSchema, z } from 'zod'

import type * as Api from './Api'
import * as schema from './validate'
import { snakeify } from './util'

type MaybePromise<T> = T | Promise<T>

/**
 * Custom transformer: convenience function for setting response `status` and/or
 * `delay`.
 *
 * @see https://mswjs.io/docs/basics/response-transformer#custom-transformer
 */
export function json<B>(
  body: B,
  options: { status?: number; delay?: number } = {}
): ResponseTransformer<B> {
  const { status = 200, delay = 0 } = options
  return compose(context.status(status), context.json(body), context.delay(delay))
}

// these are used for turning our nice JS-ified API types back into the original
// API JSON types (snake cased and dates as strings) for use in our mock API

type StringifyDates<T> = T extends Date
  ? string
  : {
      [K in keyof T]: T[K] extends Array<infer U>
        ? Array<StringifyDates<U>>
        : StringifyDates<T[K]>
    }

/**
 * Snake case fields and convert dates to strings. Not intended to be a general
 * purpose JSON type!
 */
export type Json<B> = Snakify<StringifyDates<B>>

export interface MSWHandlers {
  /** `/by-id/disks/:id` */
  diskViewById: (
    params: Api.DiskViewByIdParams
  ) => MaybePromise<Json<Api.Disk> | ResponseTransformer<Json<Api.Disk>>>
  /** `/by-id/images/:id` */
  imageViewById: (
    params: Api.ImageViewByIdParams
  ) => MaybePromise<Json<Api.Image> | ResponseTransformer<Json<Api.Image>>>
  /** `/by-id/instances/:id` */
  instanceViewById: (
    params: Api.InstanceViewByIdParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/by-id/network-interfaces/:id` */
  instanceNetworkInterfaceViewById: (
    params: Api.InstanceNetworkInterfaceViewByIdParams
  ) => MaybePromise<
    Json<Api.NetworkInterface> | ResponseTransformer<Json<Api.NetworkInterface>>
  >
  /** `/by-id/organizations/:id` */
  organizationViewById: (
    params: Api.OrganizationViewByIdParams
  ) => MaybePromise<Json<Api.Organization> | ResponseTransformer<Json<Api.Organization>>>
  /** `/by-id/projects/:id` */
  projectViewById: (
    params: Api.ProjectViewByIdParams
  ) => MaybePromise<Json<Api.Project> | ResponseTransformer<Json<Api.Project>>>
  /** `/by-id/snapshots/:id` */
  snapshotViewById: (
    params: Api.SnapshotViewByIdParams
  ) => MaybePromise<Json<Api.Snapshot> | ResponseTransformer<Json<Api.Snapshot>>>
  /** `/by-id/vpc-router-routes/:id` */
  vpcRouterRouteViewById: (
    params: Api.VpcRouterRouteViewByIdParams
  ) => MaybePromise<Json<Api.RouterRoute> | ResponseTransformer<Json<Api.RouterRoute>>>
  /** `/by-id/vpc-routers/:id` */
  vpcRouterViewById: (
    params: Api.VpcRouterViewByIdParams
  ) => MaybePromise<Json<Api.VpcRouter> | ResponseTransformer<Json<Api.VpcRouter>>>
  /** `/by-id/vpc-subnets/:id` */
  vpcSubnetViewById: (
    params: Api.VpcSubnetViewByIdParams
  ) => MaybePromise<Json<Api.VpcSubnet> | ResponseTransformer<Json<Api.VpcSubnet>>>
  /** `/by-id/vpcs/:id` */
  vpcViewById: (
    params: Api.VpcViewByIdParams
  ) => MaybePromise<Json<Api.Vpc> | ResponseTransformer<Json<Api.Vpc>>>
  /** `/device/auth` */
  deviceAuthRequest: () => MaybePromise<number | ResponseTransformer>
  /** `/device/confirm` */
  deviceAuthConfirm: (
    body: Json<Api.DeviceAuthVerify>
  ) => MaybePromise<number | ResponseTransformer>
  /** `/device/token` */
  deviceAccessToken: () => MaybePromise<number | ResponseTransformer>
  /** `/groups` */
  groupList: (
    params: Api.GroupListParams
  ) => MaybePromise<
    Json<Api.GroupResultsPage> | ResponseTransformer<Json<Api.GroupResultsPage>>
  >
  /** `/login` */
  loginSpoof: (body: Json<Api.SpoofLoginBody>) => MaybePromise<number | ResponseTransformer>
  /** `/login/:siloName/saml/:providerName` */
  loginSamlBegin: (
    params: Api.LoginSamlBeginParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/login/:siloName/saml/:providerName` */
  loginSaml: (params: Api.LoginSamlParams) => MaybePromise<number | ResponseTransformer>
  /** `/logout` */
  logout: () => MaybePromise<number | ResponseTransformer>
  /** `/organizations` */
  organizationList: (
    params: Api.OrganizationListParams
  ) => MaybePromise<
    | Json<Api.OrganizationResultsPage>
    | ResponseTransformer<Json<Api.OrganizationResultsPage>>
  >
  /** `/organizations` */
  organizationCreate: (
    body: Json<Api.OrganizationCreate>
  ) => MaybePromise<Json<Api.Organization> | ResponseTransformer<Json<Api.Organization>>>
  /** `/organizations/:orgName` */
  organizationView: (
    params: Api.OrganizationViewParams
  ) => MaybePromise<Json<Api.Organization> | ResponseTransformer<Json<Api.Organization>>>
  /** `/organizations/:orgName` */
  organizationUpdate: (
    body: Json<Api.OrganizationUpdate>,
    params: Api.OrganizationUpdateParams
  ) => MaybePromise<Json<Api.Organization> | ResponseTransformer<Json<Api.Organization>>>
  /** `/organizations/:orgName` */
  organizationDelete: (
    params: Api.OrganizationDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/policy` */
  organizationPolicyView: (
    params: Api.OrganizationPolicyViewParams
  ) => MaybePromise<
    Json<Api.OrganizationRolePolicy> | ResponseTransformer<Json<Api.OrganizationRolePolicy>>
  >
  /** `/organizations/:orgName/policy` */
  organizationPolicyUpdate: (
    body: Json<Api.OrganizationRolePolicy>,
    params: Api.OrganizationPolicyUpdateParams
  ) => MaybePromise<
    Json<Api.OrganizationRolePolicy> | ResponseTransformer<Json<Api.OrganizationRolePolicy>>
  >
  /** `/organizations/:orgName/projects` */
  projectList: (
    params: Api.ProjectListParams
  ) => MaybePromise<
    Json<Api.ProjectResultsPage> | ResponseTransformer<Json<Api.ProjectResultsPage>>
  >
  /** `/organizations/:orgName/projects` */
  projectCreate: (
    body: Json<Api.ProjectCreate>,
    params: Api.ProjectCreateParams
  ) => MaybePromise<Json<Api.Project> | ResponseTransformer<Json<Api.Project>>>
  /** `/organizations/:orgName/projects/:projectName` */
  projectView: (
    params: Api.ProjectViewParams
  ) => MaybePromise<Json<Api.Project> | ResponseTransformer<Json<Api.Project>>>
  /** `/organizations/:orgName/projects/:projectName` */
  projectUpdate: (
    body: Json<Api.ProjectUpdate>,
    params: Api.ProjectUpdateParams
  ) => MaybePromise<Json<Api.Project> | ResponseTransformer<Json<Api.Project>>>
  /** `/organizations/:orgName/projects/:projectName` */
  projectDelete: (
    params: Api.ProjectDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/disks` */
  diskList: (
    params: Api.DiskListParams
  ) => MaybePromise<
    Json<Api.DiskResultsPage> | ResponseTransformer<Json<Api.DiskResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/disks` */
  diskCreate: (
    body: Json<Api.DiskCreate>,
    params: Api.DiskCreateParams
  ) => MaybePromise<Json<Api.Disk> | ResponseTransformer<Json<Api.Disk>>>
  /** `/organizations/:orgName/projects/:projectName/disks/:diskName` */
  diskView: (
    params: Api.DiskViewParams
  ) => MaybePromise<Json<Api.Disk> | ResponseTransformer<Json<Api.Disk>>>
  /** `/organizations/:orgName/projects/:projectName/disks/:diskName` */
  diskDelete: (params: Api.DiskDeleteParams) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName` */
  diskMetricsList: (
    params: Api.DiskMetricsListParams
  ) => MaybePromise<
    Json<Api.MeasurementResultsPage> | ResponseTransformer<Json<Api.MeasurementResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/images` */
  imageList: (
    params: Api.ImageListParams
  ) => MaybePromise<
    Json<Api.ImageResultsPage> | ResponseTransformer<Json<Api.ImageResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/images` */
  imageCreate: (
    body: Json<Api.ImageCreate>,
    params: Api.ImageCreateParams
  ) => MaybePromise<Json<Api.Image> | ResponseTransformer<Json<Api.Image>>>
  /** `/organizations/:orgName/projects/:projectName/images/:imageName` */
  imageView: (
    params: Api.ImageViewParams
  ) => MaybePromise<Json<Api.Image> | ResponseTransformer<Json<Api.Image>>>
  /** `/organizations/:orgName/projects/:projectName/images/:imageName` */
  imageDelete: (params: Api.ImageDeleteParams) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/instances` */
  instanceList: (
    params: Api.InstanceListParams
  ) => MaybePromise<
    Json<Api.InstanceResultsPage> | ResponseTransformer<Json<Api.InstanceResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances` */
  instanceCreate: (
    body: Json<Api.InstanceCreate>,
    params: Api.InstanceCreateParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName` */
  instanceView: (
    params: Api.InstanceViewParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName` */
  instanceDelete: (
    params: Api.InstanceDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/disks` */
  instanceDiskList: (
    params: Api.InstanceDiskListParams
  ) => MaybePromise<
    Json<Api.DiskResultsPage> | ResponseTransformer<Json<Api.DiskResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach` */
  instanceDiskAttach: (
    body: Json<Api.DiskIdentifier>,
    params: Api.InstanceDiskAttachParams
  ) => MaybePromise<Json<Api.Disk> | ResponseTransformer<Json<Api.Disk>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach` */
  instanceDiskDetach: (
    body: Json<Api.DiskIdentifier>,
    params: Api.InstanceDiskDetachParams
  ) => MaybePromise<Json<Api.Disk> | ResponseTransformer<Json<Api.Disk>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips` */
  instanceExternalIpList: (
    params: Api.InstanceExternalIpListParams
  ) => MaybePromise<
    Json<Api.ExternalIpResultsPage> | ResponseTransformer<Json<Api.ExternalIpResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/migrate` */
  instanceMigrate: (
    body: Json<Api.InstanceMigrate>,
    params: Api.InstanceMigrateParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces` */
  instanceNetworkInterfaceList: (
    params: Api.InstanceNetworkInterfaceListParams
  ) => MaybePromise<
    | Json<Api.NetworkInterfaceResultsPage>
    | ResponseTransformer<Json<Api.NetworkInterfaceResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces` */
  instanceNetworkInterfaceCreate: (
    body: Json<Api.NetworkInterfaceCreate>,
    params: Api.InstanceNetworkInterfaceCreateParams
  ) => MaybePromise<
    Json<Api.NetworkInterface> | ResponseTransformer<Json<Api.NetworkInterface>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceView: (
    params: Api.InstanceNetworkInterfaceViewParams
  ) => MaybePromise<
    Json<Api.NetworkInterface> | ResponseTransformer<Json<Api.NetworkInterface>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceUpdate: (
    body: Json<Api.NetworkInterfaceUpdate>,
    params: Api.InstanceNetworkInterfaceUpdateParams
  ) => MaybePromise<
    Json<Api.NetworkInterface> | ResponseTransformer<Json<Api.NetworkInterface>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceDelete: (
    params: Api.InstanceNetworkInterfaceDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/reboot` */
  instanceReboot: (
    params: Api.InstanceRebootParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console` */
  instanceSerialConsole: (
    params: Api.InstanceSerialConsoleParams
  ) => MaybePromise<
    | Json<Api.InstanceSerialConsoleData>
    | ResponseTransformer<Json<Api.InstanceSerialConsoleData>>
  >
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/start` */
  instanceStart: (
    params: Api.InstanceStartParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/organizations/:orgName/projects/:projectName/instances/:instanceName/stop` */
  instanceStop: (
    params: Api.InstanceStopParams
  ) => MaybePromise<Json<Api.Instance> | ResponseTransformer<Json<Api.Instance>>>
  /** `/organizations/:orgName/projects/:projectName/policy` */
  projectPolicyView: (
    params: Api.ProjectPolicyViewParams
  ) => MaybePromise<
    Json<Api.ProjectRolePolicy> | ResponseTransformer<Json<Api.ProjectRolePolicy>>
  >
  /** `/organizations/:orgName/projects/:projectName/policy` */
  projectPolicyUpdate: (
    body: Json<Api.ProjectRolePolicy>,
    params: Api.ProjectPolicyUpdateParams
  ) => MaybePromise<
    Json<Api.ProjectRolePolicy> | ResponseTransformer<Json<Api.ProjectRolePolicy>>
  >
  /** `/organizations/:orgName/projects/:projectName/snapshots` */
  snapshotList: (
    params: Api.SnapshotListParams
  ) => MaybePromise<
    Json<Api.SnapshotResultsPage> | ResponseTransformer<Json<Api.SnapshotResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/snapshots` */
  snapshotCreate: (
    body: Json<Api.SnapshotCreate>,
    params: Api.SnapshotCreateParams
  ) => MaybePromise<Json<Api.Snapshot> | ResponseTransformer<Json<Api.Snapshot>>>
  /** `/organizations/:orgName/projects/:projectName/snapshots/:snapshotName` */
  snapshotView: (
    params: Api.SnapshotViewParams
  ) => MaybePromise<Json<Api.Snapshot> | ResponseTransformer<Json<Api.Snapshot>>>
  /** `/organizations/:orgName/projects/:projectName/snapshots/:snapshotName` */
  snapshotDelete: (
    params: Api.SnapshotDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/vpcs` */
  vpcList: (
    params: Api.VpcListParams
  ) => MaybePromise<
    Json<Api.VpcResultsPage> | ResponseTransformer<Json<Api.VpcResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/vpcs` */
  vpcCreate: (
    body: Json<Api.VpcCreate>,
    params: Api.VpcCreateParams
  ) => MaybePromise<Json<Api.Vpc> | ResponseTransformer<Json<Api.Vpc>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcView: (
    params: Api.VpcViewParams
  ) => MaybePromise<Json<Api.Vpc> | ResponseTransformer<Json<Api.Vpc>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcUpdate: (
    body: Json<Api.VpcUpdate>,
    params: Api.VpcUpdateParams
  ) => MaybePromise<Json<Api.Vpc> | ResponseTransformer<Json<Api.Vpc>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcDelete: (params: Api.VpcDeleteParams) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules` */
  vpcFirewallRulesView: (
    params: Api.VpcFirewallRulesViewParams
  ) => MaybePromise<
    Json<Api.VpcFirewallRules> | ResponseTransformer<Json<Api.VpcFirewallRules>>
  >
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules` */
  vpcFirewallRulesUpdate: (
    body: Json<Api.VpcFirewallRuleUpdateParams>,
    params: Api.VpcFirewallRulesUpdateParams
  ) => MaybePromise<
    Json<Api.VpcFirewallRules> | ResponseTransformer<Json<Api.VpcFirewallRules>>
  >
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers` */
  vpcRouterList: (
    params: Api.VpcRouterListParams
  ) => MaybePromise<
    Json<Api.VpcRouterResultsPage> | ResponseTransformer<Json<Api.VpcRouterResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers` */
  vpcRouterCreate: (
    body: Json<Api.VpcRouterCreate>,
    params: Api.VpcRouterCreateParams
  ) => MaybePromise<Json<Api.VpcRouter> | ResponseTransformer<Json<Api.VpcRouter>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterView: (
    params: Api.VpcRouterViewParams
  ) => MaybePromise<Json<Api.VpcRouter> | ResponseTransformer<Json<Api.VpcRouter>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterUpdate: (
    body: Json<Api.VpcRouterUpdate>,
    params: Api.VpcRouterUpdateParams
  ) => MaybePromise<Json<Api.VpcRouter> | ResponseTransformer<Json<Api.VpcRouter>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterDelete: (
    params: Api.VpcRouterDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes` */
  vpcRouterRouteList: (
    params: Api.VpcRouterRouteListParams
  ) => MaybePromise<
    Json<Api.RouterRouteResultsPage> | ResponseTransformer<Json<Api.RouterRouteResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes` */
  vpcRouterRouteCreate: (
    body: Json<Api.RouterRouteCreateParams>,
    params: Api.VpcRouterRouteCreateParams
  ) => MaybePromise<Json<Api.RouterRoute> | ResponseTransformer<Json<Api.RouterRoute>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteView: (
    params: Api.VpcRouterRouteViewParams
  ) => MaybePromise<Json<Api.RouterRoute> | ResponseTransformer<Json<Api.RouterRoute>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteUpdate: (
    body: Json<Api.RouterRouteUpdateParams>,
    params: Api.VpcRouterRouteUpdateParams
  ) => MaybePromise<Json<Api.RouterRoute> | ResponseTransformer<Json<Api.RouterRoute>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteDelete: (
    params: Api.VpcRouterRouteDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets` */
  vpcSubnetList: (
    params: Api.VpcSubnetListParams
  ) => MaybePromise<
    Json<Api.VpcSubnetResultsPage> | ResponseTransformer<Json<Api.VpcSubnetResultsPage>>
  >
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets` */
  vpcSubnetCreate: (
    body: Json<Api.VpcSubnetCreate>,
    params: Api.VpcSubnetCreateParams
  ) => MaybePromise<Json<Api.VpcSubnet> | ResponseTransformer<Json<Api.VpcSubnet>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetView: (
    params: Api.VpcSubnetViewParams
  ) => MaybePromise<Json<Api.VpcSubnet> | ResponseTransformer<Json<Api.VpcSubnet>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetUpdate: (
    body: Json<Api.VpcSubnetUpdate>,
    params: Api.VpcSubnetUpdateParams
  ) => MaybePromise<Json<Api.VpcSubnet> | ResponseTransformer<Json<Api.VpcSubnet>>>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetDelete: (
    params: Api.VpcSubnetDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName/network-interfaces` */
  vpcSubnetListNetworkInterfaces: (
    params: Api.VpcSubnetListNetworkInterfacesParams
  ) => MaybePromise<
    | Json<Api.NetworkInterfaceResultsPage>
    | ResponseTransformer<Json<Api.NetworkInterfaceResultsPage>>
  >
  /** `/policy` */
  policyView: () => MaybePromise<
    Json<Api.SiloRolePolicy> | ResponseTransformer<Json<Api.SiloRolePolicy>>
  >
  /** `/policy` */
  policyUpdate: (
    body: Json<Api.SiloRolePolicy>
  ) => MaybePromise<
    Json<Api.SiloRolePolicy> | ResponseTransformer<Json<Api.SiloRolePolicy>>
  >
  /** `/roles` */
  roleList: (
    params: Api.RoleListParams
  ) => MaybePromise<
    Json<Api.RoleResultsPage> | ResponseTransformer<Json<Api.RoleResultsPage>>
  >
  /** `/roles/:roleName` */
  roleView: (
    params: Api.RoleViewParams
  ) => MaybePromise<Json<Api.Role> | ResponseTransformer<Json<Api.Role>>>
  /** `/session/me` */
  sessionMe: () => MaybePromise<Json<Api.User> | ResponseTransformer<Json<Api.User>>>
  /** `/session/me/sshkeys` */
  sessionSshkeyList: (
    params: Api.SessionSshkeyListParams
  ) => MaybePromise<
    Json<Api.SshKeyResultsPage> | ResponseTransformer<Json<Api.SshKeyResultsPage>>
  >
  /** `/session/me/sshkeys` */
  sessionSshkeyCreate: (
    body: Json<Api.SshKeyCreate>
  ) => MaybePromise<Json<Api.SshKey> | ResponseTransformer<Json<Api.SshKey>>>
  /** `/session/me/sshkeys/:sshKeyName` */
  sessionSshkeyView: (
    params: Api.SessionSshkeyViewParams
  ) => MaybePromise<Json<Api.SshKey> | ResponseTransformer<Json<Api.SshKey>>>
  /** `/session/me/sshkeys/:sshKeyName` */
  sessionSshkeyDelete: (
    params: Api.SessionSshkeyDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/system/by-id/images/:id` */
  systemImageViewById: (
    params: Api.SystemImageViewByIdParams
  ) => MaybePromise<Json<Api.GlobalImage> | ResponseTransformer<Json<Api.GlobalImage>>>
  /** `/system/by-id/ip-pools/:id` */
  ipPoolViewById: (
    params: Api.IpPoolViewByIdParams
  ) => MaybePromise<Json<Api.IpPool> | ResponseTransformer<Json<Api.IpPool>>>
  /** `/system/by-id/silos/:id` */
  siloViewById: (
    params: Api.SiloViewByIdParams
  ) => MaybePromise<Json<Api.Silo> | ResponseTransformer<Json<Api.Silo>>>
  /** `/system/hardware/racks` */
  rackList: (
    params: Api.RackListParams
  ) => MaybePromise<
    Json<Api.RackResultsPage> | ResponseTransformer<Json<Api.RackResultsPage>>
  >
  /** `/system/hardware/racks/:rackId` */
  rackView: (
    params: Api.RackViewParams
  ) => MaybePromise<Json<Api.Rack> | ResponseTransformer<Json<Api.Rack>>>
  /** `/system/hardware/sleds` */
  sledList: (
    params: Api.SledListParams
  ) => MaybePromise<
    Json<Api.SledResultsPage> | ResponseTransformer<Json<Api.SledResultsPage>>
  >
  /** `/system/hardware/sleds/:sledId` */
  sledView: (
    params: Api.SledViewParams
  ) => MaybePromise<Json<Api.Sled> | ResponseTransformer<Json<Api.Sled>>>
  /** `/system/images` */
  systemImageList: (
    params: Api.SystemImageListParams
  ) => MaybePromise<
    Json<Api.GlobalImageResultsPage> | ResponseTransformer<Json<Api.GlobalImageResultsPage>>
  >
  /** `/system/images` */
  systemImageCreate: (
    body: Json<Api.GlobalImageCreate>
  ) => MaybePromise<Json<Api.GlobalImage> | ResponseTransformer<Json<Api.GlobalImage>>>
  /** `/system/images/:imageName` */
  systemImageView: (
    params: Api.SystemImageViewParams
  ) => MaybePromise<Json<Api.GlobalImage> | ResponseTransformer<Json<Api.GlobalImage>>>
  /** `/system/images/:imageName` */
  systemImageDelete: (
    params: Api.SystemImageDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/system/ip-pools` */
  ipPoolList: (
    params: Api.IpPoolListParams
  ) => MaybePromise<
    Json<Api.IpPoolResultsPage> | ResponseTransformer<Json<Api.IpPoolResultsPage>>
  >
  /** `/system/ip-pools` */
  ipPoolCreate: (
    body: Json<Api.IpPoolCreate>
  ) => MaybePromise<Json<Api.IpPool> | ResponseTransformer<Json<Api.IpPool>>>
  /** `/system/ip-pools/:poolName` */
  ipPoolView: (
    params: Api.IpPoolViewParams
  ) => MaybePromise<Json<Api.IpPool> | ResponseTransformer<Json<Api.IpPool>>>
  /** `/system/ip-pools/:poolName` */
  ipPoolUpdate: (
    body: Json<Api.IpPoolUpdate>,
    params: Api.IpPoolUpdateParams
  ) => MaybePromise<Json<Api.IpPool> | ResponseTransformer<Json<Api.IpPool>>>
  /** `/system/ip-pools/:poolName` */
  ipPoolDelete: (
    params: Api.IpPoolDeleteParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/system/ip-pools/:poolName/ranges` */
  ipPoolRangeList: (
    params: Api.IpPoolRangeListParams
  ) => MaybePromise<
    Json<Api.IpPoolRangeResultsPage> | ResponseTransformer<Json<Api.IpPoolRangeResultsPage>>
  >
  /** `/system/ip-pools/:poolName/ranges/add` */
  ipPoolRangeAdd: (
    body: Json<Api.IpRange>,
    params: Api.IpPoolRangeAddParams
  ) => MaybePromise<Json<Api.IpPoolRange> | ResponseTransformer<Json<Api.IpPoolRange>>>
  /** `/system/ip-pools/:poolName/ranges/remove` */
  ipPoolRangeRemove: (
    body: Json<Api.IpRange>,
    params: Api.IpPoolRangeRemoveParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/system/ip-pools-service/:rackId` */
  ipPoolServiceView: (
    params: Api.IpPoolServiceViewParams
  ) => MaybePromise<Json<Api.IpPool> | ResponseTransformer<Json<Api.IpPool>>>
  /** `/system/ip-pools-service/:rackId/ranges` */
  ipPoolServiceRangeList: (
    params: Api.IpPoolServiceRangeListParams
  ) => MaybePromise<
    Json<Api.IpPoolRangeResultsPage> | ResponseTransformer<Json<Api.IpPoolRangeResultsPage>>
  >
  /** `/system/ip-pools-service/:rackId/ranges/add` */
  ipPoolServiceRangeAdd: (
    body: Json<Api.IpRange>,
    params: Api.IpPoolServiceRangeAddParams
  ) => MaybePromise<Json<Api.IpPoolRange> | ResponseTransformer<Json<Api.IpPoolRange>>>
  /** `/system/ip-pools-service/:rackId/ranges/remove` */
  ipPoolServiceRangeRemove: (
    body: Json<Api.IpRange>,
    params: Api.IpPoolServiceRangeRemoveParams
  ) => MaybePromise<number | ResponseTransformer>
  /** `/system/policy` */
  systemPolicyView: () => MaybePromise<
    Json<Api.FleetRolePolicy> | ResponseTransformer<Json<Api.FleetRolePolicy>>
  >
  /** `/system/policy` */
  systemPolicyUpdate: (
    body: Json<Api.FleetRolePolicy>
  ) => MaybePromise<
    Json<Api.FleetRolePolicy> | ResponseTransformer<Json<Api.FleetRolePolicy>>
  >
  /** `/system/sagas` */
  sagaList: (
    params: Api.SagaListParams
  ) => MaybePromise<
    Json<Api.SagaResultsPage> | ResponseTransformer<Json<Api.SagaResultsPage>>
  >
  /** `/system/sagas/:sagaId` */
  sagaView: (
    params: Api.SagaViewParams
  ) => MaybePromise<Json<Api.Saga> | ResponseTransformer<Json<Api.Saga>>>
  /** `/system/silos` */
  siloList: (
    params: Api.SiloListParams
  ) => MaybePromise<
    Json<Api.SiloResultsPage> | ResponseTransformer<Json<Api.SiloResultsPage>>
  >
  /** `/system/silos` */
  siloCreate: (
    body: Json<Api.SiloCreate>
  ) => MaybePromise<Json<Api.Silo> | ResponseTransformer<Json<Api.Silo>>>
  /** `/system/silos/:siloName` */
  siloView: (
    params: Api.SiloViewParams
  ) => MaybePromise<Json<Api.Silo> | ResponseTransformer<Json<Api.Silo>>>
  /** `/system/silos/:siloName` */
  siloDelete: (params: Api.SiloDeleteParams) => MaybePromise<number | ResponseTransformer>
  /** `/system/silos/:siloName/identity-providers` */
  siloIdentityProviderList: (
    params: Api.SiloIdentityProviderListParams
  ) => MaybePromise<
    | Json<Api.IdentityProviderResultsPage>
    | ResponseTransformer<Json<Api.IdentityProviderResultsPage>>
  >
  /** `/system/silos/:siloName/identity-providers/saml` */
  samlIdentityProviderCreate: (
    body: Json<Api.SamlIdentityProviderCreate>,
    params: Api.SamlIdentityProviderCreateParams
  ) => MaybePromise<
    Json<Api.SamlIdentityProvider> | ResponseTransformer<Json<Api.SamlIdentityProvider>>
  >
  /** `/system/silos/:siloName/identity-providers/saml/:providerName` */
  samlIdentityProviderView: (
    params: Api.SamlIdentityProviderViewParams
  ) => MaybePromise<
    Json<Api.SamlIdentityProvider> | ResponseTransformer<Json<Api.SamlIdentityProvider>>
  >
  /** `/system/silos/:siloName/policy` */
  siloPolicyView: (
    params: Api.SiloPolicyViewParams
  ) => MaybePromise<
    Json<Api.SiloRolePolicy> | ResponseTransformer<Json<Api.SiloRolePolicy>>
  >
  /** `/system/silos/:siloName/policy` */
  siloPolicyUpdate: (
    body: Json<Api.SiloRolePolicy>,
    params: Api.SiloPolicyUpdateParams
  ) => MaybePromise<
    Json<Api.SiloRolePolicy> | ResponseTransformer<Json<Api.SiloRolePolicy>>
  >
  /** `/system/updates/refresh` */
  updatesRefresh: () => MaybePromise<number | ResponseTransformer>
  /** `/system/user` */
  systemUserList: (
    params: Api.SystemUserListParams
  ) => MaybePromise<
    Json<Api.UserBuiltinResultsPage> | ResponseTransformer<Json<Api.UserBuiltinResultsPage>>
  >
  /** `/system/user/:userName` */
  systemUserView: (
    params: Api.SystemUserViewParams
  ) => MaybePromise<Json<Api.UserBuiltin> | ResponseTransformer<Json<Api.UserBuiltin>>>
  /** `/timeseries/schema` */
  timeseriesSchemaGet: (
    params: Api.TimeseriesSchemaGetParams
  ) => MaybePromise<
    | Json<Api.TimeseriesSchemaResultsPage>
    | ResponseTransformer<Json<Api.TimeseriesSchemaResultsPage>>
  >
  /** `/users` */
  userList: (
    params: Api.UserListParams
  ) => MaybePromise<
    Json<Api.UserResultsPage> | ResponseTransformer<Json<Api.UserResultsPage>>
  >
}

function validateBody<S extends ZodSchema>(schema: S, body: unknown) {
  const result = schema.transform(snakeify).safeParse(body)
  if (result.success) {
    return { body: result.data as Json<z.infer<S>> }
  }
  return { bodyErr: json(result.error.issues, { status: 400 }) }
}
function validateParams<S extends ZodSchema>(schema: S, req: RestRequest) {
  const rawParams = new URLSearchParams(req.url.search)
  const params: [string, unknown][] = []

  // Ensure numeric params like `limit` are parsed as numbers
  for (const [name, value] of rawParams) {
    params.push([name, isNaN(Number(value)) ? value : Number(value)])
  }

  const result = schema.safeParse({
    ...req.params,
    ...Object.fromEntries(params),
  })
  if (result.success) {
    return { params: result.data }
  }
  return { paramsErr: json(result.error.issues, { status: 400 }) }
}

const handleResult = async (
  res: ResponseComposition,
  ctx: RestContext,
  handler: () => MaybePromise<unknown>
) => {
  try {
    const result = await handler()
    if (typeof result === 'number') {
      return res(ctx.status(result))
    }
    if (typeof result === 'function') {
      return res(result as ResponseTransformer)
    }
    return res(json(result))
  } catch (thrown) {
    if (typeof thrown === 'number') {
      return res(ctx.status(thrown))
    }
    if (typeof thrown === 'function') {
      return res(thrown as ResponseTransformer)
    }
    if (typeof thrown === 'string') {
      return res(json({ message: thrown }, { status: 400 }))
    }
    console.error('Unexpected mock error', thrown)
    return res(json({ message: 'Unknown Server Error' }, { status: 500 }))
  }
}

export function makeHandlers(handlers: MSWHandlers): RestHandler[] {
  return [
    rest.get('/by-id/disks/:id', async (req, res, ctx) => {
      const handler = handlers['diskViewById']

      const { params, paramsErr } = validateParams(schema.DiskViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/images/:id', async (req, res, ctx) => {
      const handler = handlers['imageViewById']

      const { params, paramsErr } = validateParams(schema.ImageViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/instances/:id', async (req, res, ctx) => {
      const handler = handlers['instanceViewById']

      const { params, paramsErr } = validateParams(schema.InstanceViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/network-interfaces/:id', async (req, res, ctx) => {
      const handler = handlers['instanceNetworkInterfaceViewById']

      const { params, paramsErr } = validateParams(
        schema.InstanceNetworkInterfaceViewByIdParams,
        req
      )
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/organizations/:id', async (req, res, ctx) => {
      const handler = handlers['organizationViewById']

      const { params, paramsErr } = validateParams(schema.OrganizationViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/projects/:id', async (req, res, ctx) => {
      const handler = handlers['projectViewById']

      const { params, paramsErr } = validateParams(schema.ProjectViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/snapshots/:id', async (req, res, ctx) => {
      const handler = handlers['snapshotViewById']

      const { params, paramsErr } = validateParams(schema.SnapshotViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/vpc-router-routes/:id', async (req, res, ctx) => {
      const handler = handlers['vpcRouterRouteViewById']

      const { params, paramsErr } = validateParams(schema.VpcRouterRouteViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/vpc-routers/:id', async (req, res, ctx) => {
      const handler = handlers['vpcRouterViewById']

      const { params, paramsErr } = validateParams(schema.VpcRouterViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/vpc-subnets/:id', async (req, res, ctx) => {
      const handler = handlers['vpcSubnetViewById']

      const { params, paramsErr } = validateParams(schema.VpcSubnetViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/by-id/vpcs/:id', async (req, res, ctx) => {
      const handler = handlers['vpcViewById']

      const { params, paramsErr } = validateParams(schema.VpcViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/device/auth', async (req, res, ctx) => {
      const handler = handlers['deviceAuthRequest']

      return handleResult(res, ctx, () => handler())
    }),
    rest.post('/device/confirm', async (req, res, ctx) => {
      const handler = handlers['deviceAuthConfirm']

      const { body, bodyErr } = validateBody(schema.DeviceAuthVerify, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.post('/device/token', async (req, res, ctx) => {
      const handler = handlers['deviceAccessToken']

      return handleResult(res, ctx, () => handler())
    }),
    rest.get('/groups', async (req, res, ctx) => {
      const handler = handlers['groupList']

      const { params, paramsErr } = validateParams(schema.GroupListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/login', async (req, res, ctx) => {
      const handler = handlers['loginSpoof']

      const { body, bodyErr } = validateBody(schema.SpoofLoginBody, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/login/:siloName/saml/:providerName', async (req, res, ctx) => {
      const handler = handlers['loginSamlBegin']

      const { params, paramsErr } = validateParams(schema.LoginSamlBeginParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/login/:siloName/saml/:providerName', async (req, res, ctx) => {
      const handler = handlers['loginSaml']

      const { params, paramsErr } = validateParams(schema.LoginSamlParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/logout', async (req, res, ctx) => {
      const handler = handlers['logout']

      return handleResult(res, ctx, () => handler())
    }),
    rest.get('/organizations', async (req, res, ctx) => {
      const handler = handlers['organizationList']

      const { params, paramsErr } = validateParams(schema.OrganizationListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/organizations', async (req, res, ctx) => {
      const handler = handlers['organizationCreate']

      const { body, bodyErr } = validateBody(schema.OrganizationCreate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/organizations/:orgName', async (req, res, ctx) => {
      const handler = handlers['organizationView']

      const { params, paramsErr } = validateParams(schema.OrganizationViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.put('/organizations/:orgName', async (req, res, ctx) => {
      const handler = handlers['organizationUpdate']

      const { params, paramsErr } = validateParams(schema.OrganizationUpdateParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.OrganizationUpdate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.delete('/organizations/:orgName', async (req, res, ctx) => {
      const handler = handlers['organizationDelete']

      const { params, paramsErr } = validateParams(schema.OrganizationDeleteParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/organizations/:orgName/policy', async (req, res, ctx) => {
      const handler = handlers['organizationPolicyView']

      const { params, paramsErr } = validateParams(schema.OrganizationPolicyViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.put('/organizations/:orgName/policy', async (req, res, ctx) => {
      const handler = handlers['organizationPolicyUpdate']

      const { params, paramsErr } = validateParams(
        schema.OrganizationPolicyUpdateParams,
        req
      )
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(
        schema.OrganizationRolePolicy,
        await req.json()
      )
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.get('/organizations/:orgName/projects', async (req, res, ctx) => {
      const handler = handlers['projectList']

      const { params, paramsErr } = validateParams(schema.ProjectListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/organizations/:orgName/projects', async (req, res, ctx) => {
      const handler = handlers['projectCreate']

      const { params, paramsErr } = validateParams(schema.ProjectCreateParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.ProjectCreate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.get('/organizations/:orgName/projects/:projectName', async (req, res, ctx) => {
      const handler = handlers['projectView']

      const { params, paramsErr } = validateParams(schema.ProjectViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.put('/organizations/:orgName/projects/:projectName', async (req, res, ctx) => {
      const handler = handlers['projectUpdate']

      const { params, paramsErr } = validateParams(schema.ProjectUpdateParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.ProjectUpdate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.delete('/organizations/:orgName/projects/:projectName', async (req, res, ctx) => {
      const handler = handlers['projectDelete']

      const { params, paramsErr } = validateParams(schema.ProjectDeleteParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get(
      '/organizations/:orgName/projects/:projectName/disks',
      async (req, res, ctx) => {
        const handler = handlers['diskList']

        const { params, paramsErr } = validateParams(schema.DiskListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/disks',
      async (req, res, ctx) => {
        const handler = handlers['diskCreate']

        const { params, paramsErr } = validateParams(schema.DiskCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.DiskCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/disks/:diskName',
      async (req, res, ctx) => {
        const handler = handlers['diskView']

        const { params, paramsErr } = validateParams(schema.DiskViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/disks/:diskName',
      async (req, res, ctx) => {
        const handler = handlers['diskDelete']

        const { params, paramsErr } = validateParams(schema.DiskDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName',
      async (req, res, ctx) => {
        const handler = handlers['diskMetricsList']

        const { params, paramsErr } = validateParams(schema.DiskMetricsListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/images',
      async (req, res, ctx) => {
        const handler = handlers['imageList']

        const { params, paramsErr } = validateParams(schema.ImageListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/images',
      async (req, res, ctx) => {
        const handler = handlers['imageCreate']

        const { params, paramsErr } = validateParams(schema.ImageCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.ImageCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/images/:imageName',
      async (req, res, ctx) => {
        const handler = handlers['imageView']

        const { params, paramsErr } = validateParams(schema.ImageViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/images/:imageName',
      async (req, res, ctx) => {
        const handler = handlers['imageDelete']

        const { params, paramsErr } = validateParams(schema.ImageDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances',
      async (req, res, ctx) => {
        const handler = handlers['instanceList']

        const { params, paramsErr } = validateParams(schema.InstanceListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances',
      async (req, res, ctx) => {
        const handler = handlers['instanceCreate']

        const { params, paramsErr } = validateParams(schema.InstanceCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.InstanceCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName',
      async (req, res, ctx) => {
        const handler = handlers['instanceView']

        const { params, paramsErr } = validateParams(schema.InstanceViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName',
      async (req, res, ctx) => {
        const handler = handlers['instanceDelete']

        const { params, paramsErr } = validateParams(schema.InstanceDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks',
      async (req, res, ctx) => {
        const handler = handlers['instanceDiskList']

        const { params, paramsErr } = validateParams(schema.InstanceDiskListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach',
      async (req, res, ctx) => {
        const handler = handlers['instanceDiskAttach']

        const { params, paramsErr } = validateParams(schema.InstanceDiskAttachParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.DiskIdentifier, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach',
      async (req, res, ctx) => {
        const handler = handlers['instanceDiskDetach']

        const { params, paramsErr } = validateParams(schema.InstanceDiskDetachParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.DiskIdentifier, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips',
      async (req, res, ctx) => {
        const handler = handlers['instanceExternalIpList']

        const { params, paramsErr } = validateParams(
          schema.InstanceExternalIpListParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/migrate',
      async (req, res, ctx) => {
        const handler = handlers['instanceMigrate']

        const { params, paramsErr } = validateParams(schema.InstanceMigrateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.InstanceMigrate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
      async (req, res, ctx) => {
        const handler = handlers['instanceNetworkInterfaceList']

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceListParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
      async (req, res, ctx) => {
        const handler = handlers['instanceNetworkInterfaceCreate']

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceCreateParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(
          schema.NetworkInterfaceCreate,
          await req.json()
        )
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
      async (req, res, ctx) => {
        const handler = handlers['instanceNetworkInterfaceView']

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceViewParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
      async (req, res, ctx) => {
        const handler = handlers['instanceNetworkInterfaceUpdate']

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceUpdateParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(
          schema.NetworkInterfaceUpdate,
          await req.json()
        )
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
      async (req, res, ctx) => {
        const handler = handlers['instanceNetworkInterfaceDelete']

        const { params, paramsErr } = validateParams(
          schema.InstanceNetworkInterfaceDeleteParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/reboot',
      async (req, res, ctx) => {
        const handler = handlers['instanceReboot']

        const { params, paramsErr } = validateParams(schema.InstanceRebootParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console',
      async (req, res, ctx) => {
        const handler = handlers['instanceSerialConsole']

        const { params, paramsErr } = validateParams(
          schema.InstanceSerialConsoleParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/start',
      async (req, res, ctx) => {
        const handler = handlers['instanceStart']

        const { params, paramsErr } = validateParams(schema.InstanceStartParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/stop',
      async (req, res, ctx) => {
        const handler = handlers['instanceStop']

        const { params, paramsErr } = validateParams(schema.InstanceStopParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/policy',
      async (req, res, ctx) => {
        const handler = handlers['projectPolicyView']

        const { params, paramsErr } = validateParams(schema.ProjectPolicyViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/policy',
      async (req, res, ctx) => {
        const handler = handlers['projectPolicyUpdate']

        const { params, paramsErr } = validateParams(schema.ProjectPolicyUpdateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.ProjectRolePolicy, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/snapshots',
      async (req, res, ctx) => {
        const handler = handlers['snapshotList']

        const { params, paramsErr } = validateParams(schema.SnapshotListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/snapshots',
      async (req, res, ctx) => {
        const handler = handlers['snapshotCreate']

        const { params, paramsErr } = validateParams(schema.SnapshotCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.SnapshotCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/snapshots/:snapshotName',
      async (req, res, ctx) => {
        const handler = handlers['snapshotView']

        const { params, paramsErr } = validateParams(schema.SnapshotViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/snapshots/:snapshotName',
      async (req, res, ctx) => {
        const handler = handlers['snapshotDelete']

        const { params, paramsErr } = validateParams(schema.SnapshotDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs',
      async (req, res, ctx) => {
        const handler = handlers['vpcList']

        const { params, paramsErr } = validateParams(schema.VpcListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs',
      async (req, res, ctx) => {
        const handler = handlers['vpcCreate']

        const { params, paramsErr } = validateParams(schema.VpcCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.VpcCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
      async (req, res, ctx) => {
        const handler = handlers['vpcView']

        const { params, paramsErr } = validateParams(schema.VpcViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
      async (req, res, ctx) => {
        const handler = handlers['vpcUpdate']

        const { params, paramsErr } = validateParams(schema.VpcUpdateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.VpcUpdate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
      async (req, res, ctx) => {
        const handler = handlers['vpcDelete']

        const { params, paramsErr } = validateParams(schema.VpcDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
      async (req, res, ctx) => {
        const handler = handlers['vpcFirewallRulesView']

        const { params, paramsErr } = validateParams(schema.VpcFirewallRulesViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
      async (req, res, ctx) => {
        const handler = handlers['vpcFirewallRulesUpdate']

        const { params, paramsErr } = validateParams(
          schema.VpcFirewallRulesUpdateParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(
          schema.VpcFirewallRuleUpdateParams,
          await req.json()
        )
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterList']

        const { params, paramsErr } = validateParams(schema.VpcRouterListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterCreate']

        const { params, paramsErr } = validateParams(schema.VpcRouterCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.VpcRouterCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterView']

        const { params, paramsErr } = validateParams(schema.VpcRouterViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterUpdate']

        const { params, paramsErr } = validateParams(schema.VpcRouterUpdateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.VpcRouterUpdate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterDelete']

        const { params, paramsErr } = validateParams(schema.VpcRouterDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterRouteList']

        const { params, paramsErr } = validateParams(schema.VpcRouterRouteListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterRouteCreate']

        const { params, paramsErr } = validateParams(schema.VpcRouterRouteCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(
          schema.RouterRouteCreateParams,
          await req.json()
        )
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterRouteView']

        const { params, paramsErr } = validateParams(schema.VpcRouterRouteViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterRouteUpdate']

        const { params, paramsErr } = validateParams(schema.VpcRouterRouteUpdateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(
          schema.RouterRouteUpdateParams,
          await req.json()
        )
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName',
      async (req, res, ctx) => {
        const handler = handlers['vpcRouterRouteDelete']

        const { params, paramsErr } = validateParams(schema.VpcRouterRouteDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
      async (req, res, ctx) => {
        const handler = handlers['vpcSubnetList']

        const { params, paramsErr } = validateParams(schema.VpcSubnetListParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
      async (req, res, ctx) => {
        const handler = handlers['vpcSubnetCreate']

        const { params, paramsErr } = validateParams(schema.VpcSubnetCreateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.VpcSubnetCreate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
      async (req, res, ctx) => {
        const handler = handlers['vpcSubnetView']

        const { params, paramsErr } = validateParams(schema.VpcSubnetViewParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
      async (req, res, ctx) => {
        const handler = handlers['vpcSubnetUpdate']

        const { params, paramsErr } = validateParams(schema.VpcSubnetUpdateParams, req)
        if (paramsErr) return res(paramsErr)

        const { body, bodyErr } = validateBody(schema.VpcSubnetUpdate, await req.json())
        if (bodyErr) return res(bodyErr)

        return handleResult(res, ctx, () => handler(body, params))
      }
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
      async (req, res, ctx) => {
        const handler = handlers['vpcSubnetDelete']

        const { params, paramsErr } = validateParams(schema.VpcSubnetDeleteParams, req)
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName/network-interfaces',
      async (req, res, ctx) => {
        const handler = handlers['vpcSubnetListNetworkInterfaces']

        const { params, paramsErr } = validateParams(
          schema.VpcSubnetListNetworkInterfacesParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get('/policy', async (req, res, ctx) => {
      const handler = handlers['policyView']

      return handleResult(res, ctx, () => handler())
    }),
    rest.put('/policy', async (req, res, ctx) => {
      const handler = handlers['policyUpdate']

      const { body, bodyErr } = validateBody(schema.SiloRolePolicy, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/roles', async (req, res, ctx) => {
      const handler = handlers['roleList']

      const { params, paramsErr } = validateParams(schema.RoleListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/roles/:roleName', async (req, res, ctx) => {
      const handler = handlers['roleView']

      const { params, paramsErr } = validateParams(schema.RoleViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/session/me', async (req, res, ctx) => {
      const handler = handlers['sessionMe']

      return handleResult(res, ctx, () => handler())
    }),
    rest.get('/session/me/sshkeys', async (req, res, ctx) => {
      const handler = handlers['sessionSshkeyList']

      const { params, paramsErr } = validateParams(schema.SessionSshkeyListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/session/me/sshkeys', async (req, res, ctx) => {
      const handler = handlers['sessionSshkeyCreate']

      const { body, bodyErr } = validateBody(schema.SshKeyCreate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/session/me/sshkeys/:sshKeyName', async (req, res, ctx) => {
      const handler = handlers['sessionSshkeyView']

      const { params, paramsErr } = validateParams(schema.SessionSshkeyViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.delete('/session/me/sshkeys/:sshKeyName', async (req, res, ctx) => {
      const handler = handlers['sessionSshkeyDelete']

      const { params, paramsErr } = validateParams(schema.SessionSshkeyDeleteParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/by-id/images/:id', async (req, res, ctx) => {
      const handler = handlers['systemImageViewById']

      const { params, paramsErr } = validateParams(schema.SystemImageViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/by-id/ip-pools/:id', async (req, res, ctx) => {
      const handler = handlers['ipPoolViewById']

      const { params, paramsErr } = validateParams(schema.IpPoolViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/by-id/silos/:id', async (req, res, ctx) => {
      const handler = handlers['siloViewById']

      const { params, paramsErr } = validateParams(schema.SiloViewByIdParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/hardware/racks', async (req, res, ctx) => {
      const handler = handlers['rackList']

      const { params, paramsErr } = validateParams(schema.RackListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/hardware/racks/:rackId', async (req, res, ctx) => {
      const handler = handlers['rackView']

      const { params, paramsErr } = validateParams(schema.RackViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/hardware/sleds', async (req, res, ctx) => {
      const handler = handlers['sledList']

      const { params, paramsErr } = validateParams(schema.SledListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/hardware/sleds/:sledId', async (req, res, ctx) => {
      const handler = handlers['sledView']

      const { params, paramsErr } = validateParams(schema.SledViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/images', async (req, res, ctx) => {
      const handler = handlers['systemImageList']

      const { params, paramsErr } = validateParams(schema.SystemImageListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/system/images', async (req, res, ctx) => {
      const handler = handlers['systemImageCreate']

      const { body, bodyErr } = validateBody(schema.GlobalImageCreate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/system/images/:imageName', async (req, res, ctx) => {
      const handler = handlers['systemImageView']

      const { params, paramsErr } = validateParams(schema.SystemImageViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.delete('/system/images/:imageName', async (req, res, ctx) => {
      const handler = handlers['systemImageDelete']

      const { params, paramsErr } = validateParams(schema.SystemImageDeleteParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/ip-pools', async (req, res, ctx) => {
      const handler = handlers['ipPoolList']

      const { params, paramsErr } = validateParams(schema.IpPoolListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/system/ip-pools', async (req, res, ctx) => {
      const handler = handlers['ipPoolCreate']

      const { body, bodyErr } = validateBody(schema.IpPoolCreate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/system/ip-pools/:poolName', async (req, res, ctx) => {
      const handler = handlers['ipPoolView']

      const { params, paramsErr } = validateParams(schema.IpPoolViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.put('/system/ip-pools/:poolName', async (req, res, ctx) => {
      const handler = handlers['ipPoolUpdate']

      const { params, paramsErr } = validateParams(schema.IpPoolUpdateParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.IpPoolUpdate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.delete('/system/ip-pools/:poolName', async (req, res, ctx) => {
      const handler = handlers['ipPoolDelete']

      const { params, paramsErr } = validateParams(schema.IpPoolDeleteParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/ip-pools/:poolName/ranges', async (req, res, ctx) => {
      const handler = handlers['ipPoolRangeList']

      const { params, paramsErr } = validateParams(schema.IpPoolRangeListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/system/ip-pools/:poolName/ranges/add', async (req, res, ctx) => {
      const handler = handlers['ipPoolRangeAdd']

      const { params, paramsErr } = validateParams(schema.IpPoolRangeAddParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.IpRange, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.post('/system/ip-pools/:poolName/ranges/remove', async (req, res, ctx) => {
      const handler = handlers['ipPoolRangeRemove']

      const { params, paramsErr } = validateParams(schema.IpPoolRangeRemoveParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.IpRange, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.get('/system/ip-pools-service/:rackId', async (req, res, ctx) => {
      const handler = handlers['ipPoolServiceView']

      const { params, paramsErr } = validateParams(schema.IpPoolServiceViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/ip-pools-service/:rackId/ranges', async (req, res, ctx) => {
      const handler = handlers['ipPoolServiceRangeList']

      const { params, paramsErr } = validateParams(schema.IpPoolServiceRangeListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/system/ip-pools-service/:rackId/ranges/add', async (req, res, ctx) => {
      const handler = handlers['ipPoolServiceRangeAdd']

      const { params, paramsErr } = validateParams(schema.IpPoolServiceRangeAddParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.IpRange, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.post('/system/ip-pools-service/:rackId/ranges/remove', async (req, res, ctx) => {
      const handler = handlers['ipPoolServiceRangeRemove']

      const { params, paramsErr } = validateParams(
        schema.IpPoolServiceRangeRemoveParams,
        req
      )
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.IpRange, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.get('/system/policy', async (req, res, ctx) => {
      const handler = handlers['systemPolicyView']

      return handleResult(res, ctx, () => handler())
    }),
    rest.put('/system/policy', async (req, res, ctx) => {
      const handler = handlers['systemPolicyUpdate']

      const { body, bodyErr } = validateBody(schema.FleetRolePolicy, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/system/sagas', async (req, res, ctx) => {
      const handler = handlers['sagaList']

      const { params, paramsErr } = validateParams(schema.SagaListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/sagas/:sagaId', async (req, res, ctx) => {
      const handler = handlers['sagaView']

      const { params, paramsErr } = validateParams(schema.SagaViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/silos', async (req, res, ctx) => {
      const handler = handlers['siloList']

      const { params, paramsErr } = validateParams(schema.SiloListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/system/silos', async (req, res, ctx) => {
      const handler = handlers['siloCreate']

      const { body, bodyErr } = validateBody(schema.SiloCreate, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body))
    }),
    rest.get('/system/silos/:siloName', async (req, res, ctx) => {
      const handler = handlers['siloView']

      const { params, paramsErr } = validateParams(schema.SiloViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.delete('/system/silos/:siloName', async (req, res, ctx) => {
      const handler = handlers['siloDelete']

      const { params, paramsErr } = validateParams(schema.SiloDeleteParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/silos/:siloName/identity-providers', async (req, res, ctx) => {
      const handler = handlers['siloIdentityProviderList']

      const { params, paramsErr } = validateParams(
        schema.SiloIdentityProviderListParams,
        req
      )
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.post('/system/silos/:siloName/identity-providers/saml', async (req, res, ctx) => {
      const handler = handlers['samlIdentityProviderCreate']

      const { params, paramsErr } = validateParams(
        schema.SamlIdentityProviderCreateParams,
        req
      )
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(
        schema.SamlIdentityProviderCreate,
        await req.json()
      )
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.get(
      '/system/silos/:siloName/identity-providers/saml/:providerName',
      async (req, res, ctx) => {
        const handler = handlers['samlIdentityProviderView']

        const { params, paramsErr } = validateParams(
          schema.SamlIdentityProviderViewParams,
          req
        )
        if (paramsErr) return res(paramsErr)

        return handleResult(res, ctx, () => handler(params))
      }
    ),
    rest.get('/system/silos/:siloName/policy', async (req, res, ctx) => {
      const handler = handlers['siloPolicyView']

      const { params, paramsErr } = validateParams(schema.SiloPolicyViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.put('/system/silos/:siloName/policy', async (req, res, ctx) => {
      const handler = handlers['siloPolicyUpdate']

      const { params, paramsErr } = validateParams(schema.SiloPolicyUpdateParams, req)
      if (paramsErr) return res(paramsErr)

      const { body, bodyErr } = validateBody(schema.SiloRolePolicy, await req.json())
      if (bodyErr) return res(bodyErr)

      return handleResult(res, ctx, () => handler(body, params))
    }),
    rest.post('/system/updates/refresh', async (req, res, ctx) => {
      const handler = handlers['updatesRefresh']

      return handleResult(res, ctx, () => handler())
    }),
    rest.get('/system/user', async (req, res, ctx) => {
      const handler = handlers['systemUserList']

      const { params, paramsErr } = validateParams(schema.SystemUserListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/system/user/:userName', async (req, res, ctx) => {
      const handler = handlers['systemUserView']

      const { params, paramsErr } = validateParams(schema.SystemUserViewParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/timeseries/schema', async (req, res, ctx) => {
      const handler = handlers['timeseriesSchemaGet']

      const { params, paramsErr } = validateParams(schema.TimeseriesSchemaGetParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
    rest.get('/users', async (req, res, ctx) => {
      const handler = handlers['userList']

      const { params, paramsErr } = validateParams(schema.UserListParams, req)
      if (paramsErr) return res(paramsErr)

      return handleResult(res, ctx, () => handler(params))
    }),
  ]
}
