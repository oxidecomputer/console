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

type HandlerResult<T> = Json<T> | ResponseTransformer<Json<T>>
type StatusCode = number

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
  /** `GET /by-id/disks/:id` */
  diskViewById: ({ path }: { path: Api.DiskViewByIdPathParams }) => HandlerResult<Api.Disk>
  /** `GET /by-id/images/:id` */
  imageViewById: ({
    path,
  }: {
    path: Api.ImageViewByIdPathParams
  }) => HandlerResult<Api.Image>
  /** `GET /by-id/instances/:id` */
  instanceViewById: ({
    path,
  }: {
    path: Api.InstanceViewByIdPathParams
  }) => HandlerResult<Api.Instance>
  /** `GET /by-id/network-interfaces/:id` */
  instanceNetworkInterfaceViewById: ({
    path,
  }: {
    path: Api.InstanceNetworkInterfaceViewByIdPathParams
  }) => HandlerResult<Api.NetworkInterface>
  /** `GET /by-id/organizations/:id` */
  organizationViewById: ({
    path,
  }: {
    path: Api.OrganizationViewByIdPathParams
  }) => HandlerResult<Api.Organization>
  /** `GET /by-id/projects/:id` */
  projectViewById: ({
    path,
  }: {
    path: Api.ProjectViewByIdPathParams
  }) => HandlerResult<Api.Project>
  /** `GET /by-id/snapshots/:id` */
  snapshotViewById: ({
    path,
  }: {
    path: Api.SnapshotViewByIdPathParams
  }) => HandlerResult<Api.Snapshot>
  /** `GET /by-id/vpc-router-routes/:id` */
  vpcRouterRouteViewById: ({
    path,
  }: {
    path: Api.VpcRouterRouteViewByIdPathParams
  }) => HandlerResult<Api.RouterRoute>
  /** `GET /by-id/vpc-routers/:id` */
  vpcRouterViewById: ({
    path,
  }: {
    path: Api.VpcRouterViewByIdPathParams
  }) => HandlerResult<Api.VpcRouter>
  /** `GET /by-id/vpc-subnets/:id` */
  vpcSubnetViewById: ({
    path,
  }: {
    path: Api.VpcSubnetViewByIdPathParams
  }) => HandlerResult<Api.VpcSubnet>
  /** `GET /by-id/vpcs/:id` */
  vpcViewById: ({ path }: { path: Api.VpcViewByIdPathParams }) => HandlerResult<Api.Vpc>
  /** `POST /device/auth` */
  deviceAuthRequest: () => StatusCode
  /** `POST /device/confirm` */
  deviceAuthConfirm: (body: Json<Api.DeviceAuthVerify>) => StatusCode
  /** `POST /device/token` */
  deviceAccessToken: () => StatusCode
  /** `GET /groups` */
  groupList: ({
    query,
  }: {
    query: Api.GroupListQueryParams
  }) => HandlerResult<Api.GroupResultsPage>
  /** `POST /login` */
  loginSpoof: (body: Json<Api.SpoofLoginBody>) => StatusCode
  /** `GET /login/:siloName/saml/:providerName` */
  loginSamlBegin: ({ path }: { path: Api.LoginSamlBeginPathParams }) => StatusCode
  /** `POST /login/:siloName/saml/:providerName` */
  loginSaml: ({ path }: { path: Api.LoginSamlPathParams }) => StatusCode
  /** `POST /logout` */
  logout: () => StatusCode
  /** `GET /organizations` */
  organizationList: ({
    query,
  }: {
    query: Api.OrganizationListQueryParams
  }) => HandlerResult<Api.OrganizationResultsPage>
  /** `POST /organizations` */
  organizationCreate: (
    body: Json<Api.OrganizationCreate>
  ) => HandlerResult<Api.Organization>
  /** `GET /organizations/:orgName` */
  organizationView: ({
    path,
  }: {
    path: Api.OrganizationViewPathParams
  }) => HandlerResult<Api.Organization>
  /** `PUT /organizations/:orgName` */
  organizationUpdate: (
    { path }: { path: Api.OrganizationUpdatePathParams },
    body: Json<Api.OrganizationUpdate>
  ) => HandlerResult<Api.Organization>
  /** `DELETE /organizations/:orgName` */
  organizationDelete: ({ path }: { path: Api.OrganizationDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/policy` */
  organizationPolicyView: ({
    path,
  }: {
    path: Api.OrganizationPolicyViewPathParams
  }) => HandlerResult<Api.OrganizationRolePolicy>
  /** `PUT /organizations/:orgName/policy` */
  organizationPolicyUpdate: (
    { path }: { path: Api.OrganizationPolicyUpdatePathParams },
    body: Json<Api.OrganizationRolePolicy>
  ) => HandlerResult<Api.OrganizationRolePolicy>
  /** `GET /organizations/:orgName/projects` */
  projectList: ({
    path,
    query,
  }: {
    path: Api.ProjectListPathParams
    query: Api.ProjectListQueryParams
  }) => HandlerResult<Api.ProjectResultsPage>
  /** `POST /organizations/:orgName/projects` */
  projectCreate: (
    { path }: { path: Api.ProjectCreatePathParams },
    body: Json<Api.ProjectCreate>
  ) => HandlerResult<Api.Project>
  /** `GET /organizations/:orgName/projects/:projectName` */
  projectView: ({ path }: { path: Api.ProjectViewPathParams }) => HandlerResult<Api.Project>
  /** `PUT /organizations/:orgName/projects/:projectName` */
  projectUpdate: (
    { path }: { path: Api.ProjectUpdatePathParams },
    body: Json<Api.ProjectUpdate>
  ) => HandlerResult<Api.Project>
  /** `DELETE /organizations/:orgName/projects/:projectName` */
  projectDelete: ({ path }: { path: Api.ProjectDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/disks` */
  diskList: ({
    path,
    query,
  }: {
    path: Api.DiskListPathParams
    query: Api.DiskListQueryParams
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/disks` */
  diskCreate: (
    { path }: { path: Api.DiskCreatePathParams },
    body: Json<Api.DiskCreate>
  ) => HandlerResult<Api.Disk>
  /** `GET /organizations/:orgName/projects/:projectName/disks/:diskName` */
  diskView: ({ path }: { path: Api.DiskViewPathParams }) => HandlerResult<Api.Disk>
  /** `DELETE /organizations/:orgName/projects/:projectName/disks/:diskName` */
  diskDelete: ({ path }: { path: Api.DiskDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName` */
  diskMetricsList: ({
    path,
    query,
  }: {
    path: Api.DiskMetricsListPathParams
    query: Api.DiskMetricsListQueryParams
  }) => HandlerResult<Api.MeasurementResultsPage>
  /** `GET /organizations/:orgName/projects/:projectName/images` */
  imageList: ({
    path,
    query,
  }: {
    path: Api.ImageListPathParams
    query: Api.ImageListQueryParams
  }) => HandlerResult<Api.ImageResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/images` */
  imageCreate: (
    { path }: { path: Api.ImageCreatePathParams },
    body: Json<Api.ImageCreate>
  ) => HandlerResult<Api.Image>
  /** `GET /organizations/:orgName/projects/:projectName/images/:imageName` */
  imageView: ({ path }: { path: Api.ImageViewPathParams }) => HandlerResult<Api.Image>
  /** `DELETE /organizations/:orgName/projects/:projectName/images/:imageName` */
  imageDelete: ({ path }: { path: Api.ImageDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/instances` */
  instanceList: ({
    path,
    query,
  }: {
    path: Api.InstanceListPathParams
    query: Api.InstanceListQueryParams
  }) => HandlerResult<Api.InstanceResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances` */
  instanceCreate: (
    { path }: { path: Api.InstanceCreatePathParams },
    body: Json<Api.InstanceCreate>
  ) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName` */
  instanceView: ({
    path,
  }: {
    path: Api.InstanceViewPathParams
  }) => HandlerResult<Api.Instance>
  /** `DELETE /organizations/:orgName/projects/:projectName/instances/:instanceName` */
  instanceDelete: ({ path }: { path: Api.InstanceDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/disks` */
  instanceDiskList: ({
    path,
    query,
  }: {
    path: Api.InstanceDiskListPathParams
    query: Api.InstanceDiskListQueryParams
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach` */
  instanceDiskAttach: (
    { path }: { path: Api.InstanceDiskAttachPathParams },
    body: Json<Api.DiskIdentifier>
  ) => HandlerResult<Api.Disk>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach` */
  instanceDiskDetach: (
    { path }: { path: Api.InstanceDiskDetachPathParams },
    body: Json<Api.DiskIdentifier>
  ) => HandlerResult<Api.Disk>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips` */
  instanceExternalIpList: ({
    path,
  }: {
    path: Api.InstanceExternalIpListPathParams
  }) => HandlerResult<Api.ExternalIpResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/migrate` */
  instanceMigrate: (
    { path }: { path: Api.InstanceMigratePathParams },
    body: Json<Api.InstanceMigrate>
  ) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces` */
  instanceNetworkInterfaceList: ({
    path,
    query,
  }: {
    path: Api.InstanceNetworkInterfaceListPathParams
    query: Api.InstanceNetworkInterfaceListQueryParams
  }) => HandlerResult<Api.NetworkInterfaceResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces` */
  instanceNetworkInterfaceCreate: (
    { path }: { path: Api.InstanceNetworkInterfaceCreatePathParams },
    body: Json<Api.NetworkInterfaceCreate>
  ) => HandlerResult<Api.NetworkInterface>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceView: ({
    path,
  }: {
    path: Api.InstanceNetworkInterfaceViewPathParams
  }) => HandlerResult<Api.NetworkInterface>
  /** `PUT /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceUpdate: (
    { path }: { path: Api.InstanceNetworkInterfaceUpdatePathParams },
    body: Json<Api.NetworkInterfaceUpdate>
  ) => HandlerResult<Api.NetworkInterface>
  /** `DELETE /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceDelete: ({
    path,
  }: {
    path: Api.InstanceNetworkInterfaceDeletePathParams
  }) => StatusCode
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/reboot` */
  instanceReboot: ({
    path,
  }: {
    path: Api.InstanceRebootPathParams
  }) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console` */
  instanceSerialConsole: ({
    path,
    query,
  }: {
    path: Api.InstanceSerialConsolePathParams
    query: Api.InstanceSerialConsoleQueryParams
  }) => HandlerResult<Api.InstanceSerialConsoleData>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/start` */
  instanceStart: ({
    path,
  }: {
    path: Api.InstanceStartPathParams
  }) => HandlerResult<Api.Instance>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/stop` */
  instanceStop: ({
    path,
  }: {
    path: Api.InstanceStopPathParams
  }) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/policy` */
  projectPolicyView: ({
    path,
  }: {
    path: Api.ProjectPolicyViewPathParams
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `PUT /organizations/:orgName/projects/:projectName/policy` */
  projectPolicyUpdate: (
    { path }: { path: Api.ProjectPolicyUpdatePathParams },
    body: Json<Api.ProjectRolePolicy>
  ) => HandlerResult<Api.ProjectRolePolicy>
  /** `GET /organizations/:orgName/projects/:projectName/snapshots` */
  snapshotList: ({
    path,
    query,
  }: {
    path: Api.SnapshotListPathParams
    query: Api.SnapshotListQueryParams
  }) => HandlerResult<Api.SnapshotResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/snapshots` */
  snapshotCreate: (
    { path }: { path: Api.SnapshotCreatePathParams },
    body: Json<Api.SnapshotCreate>
  ) => HandlerResult<Api.Snapshot>
  /** `GET /organizations/:orgName/projects/:projectName/snapshots/:snapshotName` */
  snapshotView: ({
    path,
  }: {
    path: Api.SnapshotViewPathParams
  }) => HandlerResult<Api.Snapshot>
  /** `DELETE /organizations/:orgName/projects/:projectName/snapshots/:snapshotName` */
  snapshotDelete: ({ path }: { path: Api.SnapshotDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs` */
  vpcList: ({
    path,
    query,
  }: {
    path: Api.VpcListPathParams
    query: Api.VpcListQueryParams
  }) => HandlerResult<Api.VpcResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs` */
  vpcCreate: (
    { path }: { path: Api.VpcCreatePathParams },
    body: Json<Api.VpcCreate>
  ) => HandlerResult<Api.Vpc>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcView: ({ path }: { path: Api.VpcViewPathParams }) => HandlerResult<Api.Vpc>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcUpdate: (
    { path }: { path: Api.VpcUpdatePathParams },
    body: Json<Api.VpcUpdate>
  ) => HandlerResult<Api.Vpc>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcDelete: ({ path }: { path: Api.VpcDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules` */
  vpcFirewallRulesView: ({
    path,
  }: {
    path: Api.VpcFirewallRulesViewPathParams
  }) => HandlerResult<Api.VpcFirewallRules>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules` */
  vpcFirewallRulesUpdate: (
    { path }: { path: Api.VpcFirewallRulesUpdatePathParams },
    body: Json<Api.VpcFirewallRuleUpdateParams>
  ) => HandlerResult<Api.VpcFirewallRules>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers` */
  vpcRouterList: ({
    path,
    query,
  }: {
    path: Api.VpcRouterListPathParams
    query: Api.VpcRouterListQueryParams
  }) => HandlerResult<Api.VpcRouterResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers` */
  vpcRouterCreate: (
    { path }: { path: Api.VpcRouterCreatePathParams },
    body: Json<Api.VpcRouterCreate>
  ) => HandlerResult<Api.VpcRouter>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterView: ({
    path,
  }: {
    path: Api.VpcRouterViewPathParams
  }) => HandlerResult<Api.VpcRouter>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterUpdate: (
    { path }: { path: Api.VpcRouterUpdatePathParams },
    body: Json<Api.VpcRouterUpdate>
  ) => HandlerResult<Api.VpcRouter>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterDelete: ({ path }: { path: Api.VpcRouterDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes` */
  vpcRouterRouteList: ({
    path,
    query,
  }: {
    path: Api.VpcRouterRouteListPathParams
    query: Api.VpcRouterRouteListQueryParams
  }) => HandlerResult<Api.RouterRouteResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes` */
  vpcRouterRouteCreate: (
    { path }: { path: Api.VpcRouterRouteCreatePathParams },
    body: Json<Api.RouterRouteCreateParams>
  ) => HandlerResult<Api.RouterRoute>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteView: ({
    path,
  }: {
    path: Api.VpcRouterRouteViewPathParams
  }) => HandlerResult<Api.RouterRoute>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteUpdate: (
    { path }: { path: Api.VpcRouterRouteUpdatePathParams },
    body: Json<Api.RouterRouteUpdateParams>
  ) => HandlerResult<Api.RouterRoute>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteDelete: ({
    path,
  }: {
    path: Api.VpcRouterRouteDeletePathParams
  }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets` */
  vpcSubnetList: ({
    path,
    query,
  }: {
    path: Api.VpcSubnetListPathParams
    query: Api.VpcSubnetListQueryParams
  }) => HandlerResult<Api.VpcSubnetResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets` */
  vpcSubnetCreate: (
    { path }: { path: Api.VpcSubnetCreatePathParams },
    body: Json<Api.VpcSubnetCreate>
  ) => HandlerResult<Api.VpcSubnet>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetView: ({
    path,
  }: {
    path: Api.VpcSubnetViewPathParams
  }) => HandlerResult<Api.VpcSubnet>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetUpdate: (
    { path }: { path: Api.VpcSubnetUpdatePathParams },
    body: Json<Api.VpcSubnetUpdate>
  ) => HandlerResult<Api.VpcSubnet>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetDelete: ({ path }: { path: Api.VpcSubnetDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName/network-interfaces` */
  vpcSubnetListNetworkInterfaces: ({
    path,
    query,
  }: {
    path: Api.VpcSubnetListNetworkInterfacesPathParams
    query: Api.VpcSubnetListNetworkInterfacesQueryParams
  }) => HandlerResult<Api.NetworkInterfaceResultsPage>
  /** `GET /policy` */
  policyView: () => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /policy` */
  policyUpdate: (body: Json<Api.SiloRolePolicy>) => HandlerResult<Api.SiloRolePolicy>
  /** `GET /roles` */
  roleList: ({
    query,
  }: {
    query: Api.RoleListQueryParams
  }) => HandlerResult<Api.RoleResultsPage>
  /** `GET /roles/:roleName` */
  roleView: ({ path }: { path: Api.RoleViewPathParams }) => HandlerResult<Api.Role>
  /** `GET /session/me` */
  sessionMe: () => HandlerResult<Api.User>
  /** `GET /session/me/sshkeys` */
  sessionSshkeyList: ({
    query,
  }: {
    query: Api.SessionSshkeyListQueryParams
  }) => HandlerResult<Api.SshKeyResultsPage>
  /** `POST /session/me/sshkeys` */
  sessionSshkeyCreate: (body: Json<Api.SshKeyCreate>) => HandlerResult<Api.SshKey>
  /** `GET /session/me/sshkeys/:sshKeyName` */
  sessionSshkeyView: ({
    path,
  }: {
    path: Api.SessionSshkeyViewPathParams
  }) => HandlerResult<Api.SshKey>
  /** `DELETE /session/me/sshkeys/:sshKeyName` */
  sessionSshkeyDelete: ({ path }: { path: Api.SessionSshkeyDeletePathParams }) => StatusCode
  /** `GET /system/by-id/images/:id` */
  systemImageViewById: ({
    path,
  }: {
    path: Api.SystemImageViewByIdPathParams
  }) => HandlerResult<Api.GlobalImage>
  /** `GET /system/by-id/ip-pools/:id` */
  ipPoolViewById: ({
    path,
  }: {
    path: Api.IpPoolViewByIdPathParams
  }) => HandlerResult<Api.IpPool>
  /** `GET /system/by-id/silos/:id` */
  siloViewById: ({ path }: { path: Api.SiloViewByIdPathParams }) => HandlerResult<Api.Silo>
  /** `GET /system/hardware/racks` */
  rackList: ({
    query,
  }: {
    query: Api.RackListQueryParams
  }) => HandlerResult<Api.RackResultsPage>
  /** `GET /system/hardware/racks/:rackId` */
  rackView: ({ path }: { path: Api.RackViewPathParams }) => HandlerResult<Api.Rack>
  /** `GET /system/hardware/sleds` */
  sledList: ({
    query,
  }: {
    query: Api.SledListQueryParams
  }) => HandlerResult<Api.SledResultsPage>
  /** `GET /system/hardware/sleds/:sledId` */
  sledView: ({ path }: { path: Api.SledViewPathParams }) => HandlerResult<Api.Sled>
  /** `GET /system/images` */
  systemImageList: ({
    query,
  }: {
    query: Api.SystemImageListQueryParams
  }) => HandlerResult<Api.GlobalImageResultsPage>
  /** `POST /system/images` */
  systemImageCreate: (body: Json<Api.GlobalImageCreate>) => HandlerResult<Api.GlobalImage>
  /** `GET /system/images/:imageName` */
  systemImageView: ({
    path,
  }: {
    path: Api.SystemImageViewPathParams
  }) => HandlerResult<Api.GlobalImage>
  /** `DELETE /system/images/:imageName` */
  systemImageDelete: ({ path }: { path: Api.SystemImageDeletePathParams }) => StatusCode
  /** `GET /system/ip-pools` */
  ipPoolList: ({
    query,
  }: {
    query: Api.IpPoolListQueryParams
  }) => HandlerResult<Api.IpPoolResultsPage>
  /** `POST /system/ip-pools` */
  ipPoolCreate: (body: Json<Api.IpPoolCreate>) => HandlerResult<Api.IpPool>
  /** `GET /system/ip-pools/:poolName` */
  ipPoolView: ({ path }: { path: Api.IpPoolViewPathParams }) => HandlerResult<Api.IpPool>
  /** `PUT /system/ip-pools/:poolName` */
  ipPoolUpdate: (
    { path }: { path: Api.IpPoolUpdatePathParams },
    body: Json<Api.IpPoolUpdate>
  ) => HandlerResult<Api.IpPool>
  /** `DELETE /system/ip-pools/:poolName` */
  ipPoolDelete: ({ path }: { path: Api.IpPoolDeletePathParams }) => StatusCode
  /** `GET /system/ip-pools/:poolName/ranges` */
  ipPoolRangeList: ({
    path,
    query,
  }: {
    path: Api.IpPoolRangeListPathParams
    query: Api.IpPoolRangeListQueryParams
  }) => HandlerResult<Api.IpPoolRangeResultsPage>
  /** `POST /system/ip-pools/:poolName/ranges/add` */
  ipPoolRangeAdd: (
    { path }: { path: Api.IpPoolRangeAddPathParams },
    body: Json<Api.IpRange>
  ) => HandlerResult<Api.IpPoolRange>
  /** `POST /system/ip-pools/:poolName/ranges/remove` */
  ipPoolRangeRemove: (
    { path }: { path: Api.IpPoolRangeRemovePathParams },
    body: Json<Api.IpRange>
  ) => StatusCode
  /** `GET /system/ip-pools-service/:rackId` */
  ipPoolServiceView: ({
    path,
  }: {
    path: Api.IpPoolServiceViewPathParams
  }) => HandlerResult<Api.IpPool>
  /** `GET /system/ip-pools-service/:rackId/ranges` */
  ipPoolServiceRangeList: ({
    path,
    query,
  }: {
    path: Api.IpPoolServiceRangeListPathParams
    query: Api.IpPoolServiceRangeListQueryParams
  }) => HandlerResult<Api.IpPoolRangeResultsPage>
  /** `POST /system/ip-pools-service/:rackId/ranges/add` */
  ipPoolServiceRangeAdd: (
    { path }: { path: Api.IpPoolServiceRangeAddPathParams },
    body: Json<Api.IpRange>
  ) => HandlerResult<Api.IpPoolRange>
  /** `POST /system/ip-pools-service/:rackId/ranges/remove` */
  ipPoolServiceRangeRemove: (
    { path }: { path: Api.IpPoolServiceRangeRemovePathParams },
    body: Json<Api.IpRange>
  ) => StatusCode
  /** `GET /system/policy` */
  systemPolicyView: () => HandlerResult<Api.FleetRolePolicy>
  /** `PUT /system/policy` */
  systemPolicyUpdate: (
    body: Json<Api.FleetRolePolicy>
  ) => HandlerResult<Api.FleetRolePolicy>
  /** `GET /system/sagas` */
  sagaList: ({
    query,
  }: {
    query: Api.SagaListQueryParams
  }) => HandlerResult<Api.SagaResultsPage>
  /** `GET /system/sagas/:sagaId` */
  sagaView: ({ path }: { path: Api.SagaViewPathParams }) => HandlerResult<Api.Saga>
  /** `GET /system/silos` */
  siloList: ({
    query,
  }: {
    query: Api.SiloListQueryParams
  }) => HandlerResult<Api.SiloResultsPage>
  /** `POST /system/silos` */
  siloCreate: (body: Json<Api.SiloCreate>) => HandlerResult<Api.Silo>
  /** `GET /system/silos/:siloName` */
  siloView: ({ path }: { path: Api.SiloViewPathParams }) => HandlerResult<Api.Silo>
  /** `DELETE /system/silos/:siloName` */
  siloDelete: ({ path }: { path: Api.SiloDeletePathParams }) => StatusCode
  /** `GET /system/silos/:siloName/identity-providers` */
  siloIdentityProviderList: ({
    path,
    query,
  }: {
    path: Api.SiloIdentityProviderListPathParams
    query: Api.SiloIdentityProviderListQueryParams
  }) => HandlerResult<Api.IdentityProviderResultsPage>
  /** `POST /system/silos/:siloName/identity-providers/saml` */
  samlIdentityProviderCreate: (
    { path }: { path: Api.SamlIdentityProviderCreatePathParams },
    body: Json<Api.SamlIdentityProviderCreate>
  ) => HandlerResult<Api.SamlIdentityProvider>
  /** `GET /system/silos/:siloName/identity-providers/saml/:providerName` */
  samlIdentityProviderView: ({
    path,
  }: {
    path: Api.SamlIdentityProviderViewPathParams
  }) => HandlerResult<Api.SamlIdentityProvider>
  /** `GET /system/silos/:siloName/policy` */
  siloPolicyView: ({
    path,
  }: {
    path: Api.SiloPolicyViewPathParams
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /system/silos/:siloName/policy` */
  siloPolicyUpdate: (
    { path }: { path: Api.SiloPolicyUpdatePathParams },
    body: Json<Api.SiloRolePolicy>
  ) => HandlerResult<Api.SiloRolePolicy>
  /** `POST /system/updates/refresh` */
  updatesRefresh: () => StatusCode
  /** `GET /system/user` */
  systemUserList: ({
    query,
  }: {
    query: Api.SystemUserListQueryParams
  }) => HandlerResult<Api.UserBuiltinResultsPage>
  /** `GET /system/user/:userName` */
  systemUserView: ({
    path,
  }: {
    path: Api.SystemUserViewPathParams
  }) => HandlerResult<Api.UserBuiltin>
  /** `GET /timeseries/schema` */
  timeseriesSchemaGet: ({
    query,
  }: {
    query: Api.TimeseriesSchemaGetQueryParams
  }) => HandlerResult<Api.TimeseriesSchemaResultsPage>
  /** `GET /users` */
  userList: ({
    query,
  }: {
    query: Api.UserListQueryParams
  }) => HandlerResult<Api.UserResultsPage>
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
    path: req.params,
    query: Object.fromEntries(params),
  })
  if (result.success) {
    return { params: result.data }
  }
  return { paramsErr: json(result.error.issues, { status: 400 }) }
}

const handler =
  (
    handler: MSWHandlers[keyof MSWHandlers],
    paramSchema: ZodSchema | null,
    bodySchema: ZodSchema | null
  ) =>
  async (req: RestRequest, res: ResponseComposition, ctx: RestContext) => {
    const { params, paramsErr } = paramSchema
      ? validateParams(paramSchema, req)
      : { params: {}, paramsErr: undefined }
    if (paramsErr) return res(paramsErr)

    const { path, query } = params

    const { body, bodyErr } = bodySchema
      ? validateBody(bodySchema, await req.json())
      : { body: undefined, bodyErr: undefined }
    if (bodyErr) return res(bodyErr)

    try {
      // TypeScript can't narrow the handler down because there's not an explicit relationship between the schema
      // being present and the shape of the handler API. The type of this function could be resolved such that the
      // relevant schema is required if and only if the handler has a type that matches the inferred schema
      const result = await (handler as any).apply(null, [{ path, query, body }])
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
    rest.get(
      '/by-id/disks/:id',
      handler(handlers['diskViewById'], schema.DiskViewByIdParams, null)
    ),
    rest.get(
      '/by-id/images/:id',
      handler(handlers['imageViewById'], schema.ImageViewByIdParams, null)
    ),
    rest.get(
      '/by-id/instances/:id',
      handler(handlers['instanceViewById'], schema.InstanceViewByIdParams, null)
    ),
    rest.get(
      '/by-id/network-interfaces/:id',
      handler(
        handlers['instanceNetworkInterfaceViewById'],
        schema.InstanceNetworkInterfaceViewByIdParams,
        null
      )
    ),
    rest.get(
      '/by-id/organizations/:id',
      handler(handlers['organizationViewById'], schema.OrganizationViewByIdParams, null)
    ),
    rest.get(
      '/by-id/projects/:id',
      handler(handlers['projectViewById'], schema.ProjectViewByIdParams, null)
    ),
    rest.get(
      '/by-id/snapshots/:id',
      handler(handlers['snapshotViewById'], schema.SnapshotViewByIdParams, null)
    ),
    rest.get(
      '/by-id/vpc-router-routes/:id',
      handler(handlers['vpcRouterRouteViewById'], schema.VpcRouterRouteViewByIdParams, null)
    ),
    rest.get(
      '/by-id/vpc-routers/:id',
      handler(handlers['vpcRouterViewById'], schema.VpcRouterViewByIdParams, null)
    ),
    rest.get(
      '/by-id/vpc-subnets/:id',
      handler(handlers['vpcSubnetViewById'], schema.VpcSubnetViewByIdParams, null)
    ),
    rest.get(
      '/by-id/vpcs/:id',
      handler(handlers['vpcViewById'], schema.VpcViewByIdParams, null)
    ),
    rest.post('/device/auth', handler(handlers['deviceAuthRequest'], null, null)),
    rest.post(
      '/device/confirm',
      handler(handlers['deviceAuthConfirm'], null, schema.DeviceAuthVerify)
    ),
    rest.post('/device/token', handler(handlers['deviceAccessToken'], null, null)),
    rest.get('/groups', handler(handlers['groupList'], schema.GroupListParams, null)),
    rest.post('/login', handler(handlers['loginSpoof'], null, schema.SpoofLoginBody)),
    rest.get(
      '/login/:siloName/saml/:providerName',
      handler(handlers['loginSamlBegin'], schema.LoginSamlBeginParams, null)
    ),
    rest.post(
      '/login/:siloName/saml/:providerName',
      handler(handlers['loginSaml'], schema.LoginSamlParams, null)
    ),
    rest.post('/logout', handler(handlers['logout'], null, null)),
    rest.get(
      '/organizations',
      handler(handlers['organizationList'], schema.OrganizationListParams, null)
    ),
    rest.post(
      '/organizations',
      handler(handlers['organizationCreate'], null, schema.OrganizationCreate)
    ),
    rest.get(
      '/organizations/:orgName',
      handler(handlers['organizationView'], schema.OrganizationViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName',
      handler(
        handlers['organizationUpdate'],
        schema.OrganizationUpdateParams,
        schema.OrganizationUpdate
      )
    ),
    rest.delete(
      '/organizations/:orgName',
      handler(handlers['organizationDelete'], schema.OrganizationDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/policy',
      handler(handlers['organizationPolicyView'], schema.OrganizationPolicyViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/policy',
      handler(
        handlers['organizationPolicyUpdate'],
        schema.OrganizationPolicyUpdateParams,
        schema.OrganizationRolePolicy
      )
    ),
    rest.get(
      '/organizations/:orgName/projects',
      handler(handlers['projectList'], schema.ProjectListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects',
      handler(handlers['projectCreate'], schema.ProjectCreateParams, schema.ProjectCreate)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName',
      handler(handlers['projectView'], schema.ProjectViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName',
      handler(handlers['projectUpdate'], schema.ProjectUpdateParams, schema.ProjectUpdate)
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName',
      handler(handlers['projectDelete'], schema.ProjectDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/disks',
      handler(handlers['diskList'], schema.DiskListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/disks',
      handler(handlers['diskCreate'], schema.DiskCreateParams, schema.DiskCreate)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/disks/:diskName',
      handler(handlers['diskView'], schema.DiskViewParams, null)
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/disks/:diskName',
      handler(handlers['diskDelete'], schema.DiskDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName',
      handler(handlers['diskMetricsList'], schema.DiskMetricsListParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/images',
      handler(handlers['imageList'], schema.ImageListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/images',
      handler(handlers['imageCreate'], schema.ImageCreateParams, schema.ImageCreate)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/images/:imageName',
      handler(handlers['imageView'], schema.ImageViewParams, null)
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/images/:imageName',
      handler(handlers['imageDelete'], schema.ImageDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances',
      handler(handlers['instanceList'], schema.InstanceListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances',
      handler(
        handlers['instanceCreate'],
        schema.InstanceCreateParams,
        schema.InstanceCreate
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName',
      handler(handlers['instanceView'], schema.InstanceViewParams, null)
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName',
      handler(handlers['instanceDelete'], schema.InstanceDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks',
      handler(handlers['instanceDiskList'], schema.InstanceDiskListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach',
      handler(
        handlers['instanceDiskAttach'],
        schema.InstanceDiskAttachParams,
        schema.DiskIdentifier
      )
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach',
      handler(
        handlers['instanceDiskDetach'],
        schema.InstanceDiskDetachParams,
        schema.DiskIdentifier
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips',
      handler(handlers['instanceExternalIpList'], schema.InstanceExternalIpListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/migrate',
      handler(
        handlers['instanceMigrate'],
        schema.InstanceMigrateParams,
        schema.InstanceMigrate
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceList'],
        schema.InstanceNetworkInterfaceListParams,
        null
      )
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceCreate'],
        schema.InstanceNetworkInterfaceCreateParams,
        schema.NetworkInterfaceCreate
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
      handler(
        handlers['instanceNetworkInterfaceView'],
        schema.InstanceNetworkInterfaceViewParams,
        null
      )
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
      handler(
        handlers['instanceNetworkInterfaceUpdate'],
        schema.InstanceNetworkInterfaceUpdateParams,
        schema.NetworkInterfaceUpdate
      )
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName',
      handler(
        handlers['instanceNetworkInterfaceDelete'],
        schema.InstanceNetworkInterfaceDeleteParams,
        null
      )
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/reboot',
      handler(handlers['instanceReboot'], schema.InstanceRebootParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console',
      handler(handlers['instanceSerialConsole'], schema.InstanceSerialConsoleParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/start',
      handler(handlers['instanceStart'], schema.InstanceStartParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/stop',
      handler(handlers['instanceStop'], schema.InstanceStopParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/policy',
      handler(handlers['projectPolicyView'], schema.ProjectPolicyViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/policy',
      handler(
        handlers['projectPolicyUpdate'],
        schema.ProjectPolicyUpdateParams,
        schema.ProjectRolePolicy
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/snapshots',
      handler(handlers['snapshotList'], schema.SnapshotListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/snapshots',
      handler(
        handlers['snapshotCreate'],
        schema.SnapshotCreateParams,
        schema.SnapshotCreate
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/snapshots/:snapshotName',
      handler(handlers['snapshotView'], schema.SnapshotViewParams, null)
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/snapshots/:snapshotName',
      handler(handlers['snapshotDelete'], schema.SnapshotDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs',
      handler(handlers['vpcList'], schema.VpcListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs',
      handler(handlers['vpcCreate'], schema.VpcCreateParams, schema.VpcCreate)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
      handler(handlers['vpcView'], schema.VpcViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
      handler(handlers['vpcUpdate'], schema.VpcUpdateParams, schema.VpcUpdate)
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName',
      handler(handlers['vpcDelete'], schema.VpcDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
      handler(handlers['vpcFirewallRulesView'], schema.VpcFirewallRulesViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules',
      handler(
        handlers['vpcFirewallRulesUpdate'],
        schema.VpcFirewallRulesUpdateParams,
        schema.VpcFirewallRuleUpdateParams
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
      handler(handlers['vpcRouterList'], schema.VpcRouterListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers',
      handler(
        handlers['vpcRouterCreate'],
        schema.VpcRouterCreateParams,
        schema.VpcRouterCreate
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
      handler(handlers['vpcRouterView'], schema.VpcRouterViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
      handler(
        handlers['vpcRouterUpdate'],
        schema.VpcRouterUpdateParams,
        schema.VpcRouterUpdate
      )
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName',
      handler(handlers['vpcRouterDelete'], schema.VpcRouterDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes',
      handler(handlers['vpcRouterRouteList'], schema.VpcRouterRouteListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes',
      handler(
        handlers['vpcRouterRouteCreate'],
        schema.VpcRouterRouteCreateParams,
        schema.RouterRouteCreateParams
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName',
      handler(handlers['vpcRouterRouteView'], schema.VpcRouterRouteViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName',
      handler(
        handlers['vpcRouterRouteUpdate'],
        schema.VpcRouterRouteUpdateParams,
        schema.RouterRouteUpdateParams
      )
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName',
      handler(handlers['vpcRouterRouteDelete'], schema.VpcRouterRouteDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
      handler(handlers['vpcSubnetList'], schema.VpcSubnetListParams, null)
    ),
    rest.post(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets',
      handler(
        handlers['vpcSubnetCreate'],
        schema.VpcSubnetCreateParams,
        schema.VpcSubnetCreate
      )
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
      handler(handlers['vpcSubnetView'], schema.VpcSubnetViewParams, null)
    ),
    rest.put(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
      handler(
        handlers['vpcSubnetUpdate'],
        schema.VpcSubnetUpdateParams,
        schema.VpcSubnetUpdate
      )
    ),
    rest.delete(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName',
      handler(handlers['vpcSubnetDelete'], schema.VpcSubnetDeleteParams, null)
    ),
    rest.get(
      '/organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName/network-interfaces',
      handler(
        handlers['vpcSubnetListNetworkInterfaces'],
        schema.VpcSubnetListNetworkInterfacesParams,
        null
      )
    ),
    rest.get('/policy', handler(handlers['policyView'], null, null)),
    rest.put('/policy', handler(handlers['policyUpdate'], null, schema.SiloRolePolicy)),
    rest.get('/roles', handler(handlers['roleList'], schema.RoleListParams, null)),
    rest.get(
      '/roles/:roleName',
      handler(handlers['roleView'], schema.RoleViewParams, null)
    ),
    rest.get('/session/me', handler(handlers['sessionMe'], null, null)),
    rest.get(
      '/session/me/sshkeys',
      handler(handlers['sessionSshkeyList'], schema.SessionSshkeyListParams, null)
    ),
    rest.post(
      '/session/me/sshkeys',
      handler(handlers['sessionSshkeyCreate'], null, schema.SshKeyCreate)
    ),
    rest.get(
      '/session/me/sshkeys/:sshKeyName',
      handler(handlers['sessionSshkeyView'], schema.SessionSshkeyViewParams, null)
    ),
    rest.delete(
      '/session/me/sshkeys/:sshKeyName',
      handler(handlers['sessionSshkeyDelete'], schema.SessionSshkeyDeleteParams, null)
    ),
    rest.get(
      '/system/by-id/images/:id',
      handler(handlers['systemImageViewById'], schema.SystemImageViewByIdParams, null)
    ),
    rest.get(
      '/system/by-id/ip-pools/:id',
      handler(handlers['ipPoolViewById'], schema.IpPoolViewByIdParams, null)
    ),
    rest.get(
      '/system/by-id/silos/:id',
      handler(handlers['siloViewById'], schema.SiloViewByIdParams, null)
    ),
    rest.get(
      '/system/hardware/racks',
      handler(handlers['rackList'], schema.RackListParams, null)
    ),
    rest.get(
      '/system/hardware/racks/:rackId',
      handler(handlers['rackView'], schema.RackViewParams, null)
    ),
    rest.get(
      '/system/hardware/sleds',
      handler(handlers['sledList'], schema.SledListParams, null)
    ),
    rest.get(
      '/system/hardware/sleds/:sledId',
      handler(handlers['sledView'], schema.SledViewParams, null)
    ),
    rest.get(
      '/system/images',
      handler(handlers['systemImageList'], schema.SystemImageListParams, null)
    ),
    rest.post(
      '/system/images',
      handler(handlers['systemImageCreate'], null, schema.GlobalImageCreate)
    ),
    rest.get(
      '/system/images/:imageName',
      handler(handlers['systemImageView'], schema.SystemImageViewParams, null)
    ),
    rest.delete(
      '/system/images/:imageName',
      handler(handlers['systemImageDelete'], schema.SystemImageDeleteParams, null)
    ),
    rest.get(
      '/system/ip-pools',
      handler(handlers['ipPoolList'], schema.IpPoolListParams, null)
    ),
    rest.post(
      '/system/ip-pools',
      handler(handlers['ipPoolCreate'], null, schema.IpPoolCreate)
    ),
    rest.get(
      '/system/ip-pools/:poolName',
      handler(handlers['ipPoolView'], schema.IpPoolViewParams, null)
    ),
    rest.put(
      '/system/ip-pools/:poolName',
      handler(handlers['ipPoolUpdate'], schema.IpPoolUpdateParams, schema.IpPoolUpdate)
    ),
    rest.delete(
      '/system/ip-pools/:poolName',
      handler(handlers['ipPoolDelete'], schema.IpPoolDeleteParams, null)
    ),
    rest.get(
      '/system/ip-pools/:poolName/ranges',
      handler(handlers['ipPoolRangeList'], schema.IpPoolRangeListParams, null)
    ),
    rest.post(
      '/system/ip-pools/:poolName/ranges/add',
      handler(handlers['ipPoolRangeAdd'], schema.IpPoolRangeAddParams, schema.IpRange)
    ),
    rest.post(
      '/system/ip-pools/:poolName/ranges/remove',
      handler(handlers['ipPoolRangeRemove'], schema.IpPoolRangeRemoveParams, schema.IpRange)
    ),
    rest.get(
      '/system/ip-pools-service/:rackId',
      handler(handlers['ipPoolServiceView'], schema.IpPoolServiceViewParams, null)
    ),
    rest.get(
      '/system/ip-pools-service/:rackId/ranges',
      handler(handlers['ipPoolServiceRangeList'], schema.IpPoolServiceRangeListParams, null)
    ),
    rest.post(
      '/system/ip-pools-service/:rackId/ranges/add',
      handler(
        handlers['ipPoolServiceRangeAdd'],
        schema.IpPoolServiceRangeAddParams,
        schema.IpRange
      )
    ),
    rest.post(
      '/system/ip-pools-service/:rackId/ranges/remove',
      handler(
        handlers['ipPoolServiceRangeRemove'],
        schema.IpPoolServiceRangeRemoveParams,
        schema.IpRange
      )
    ),
    rest.get('/system/policy', handler(handlers['systemPolicyView'], null, null)),
    rest.put(
      '/system/policy',
      handler(handlers['systemPolicyUpdate'], null, schema.FleetRolePolicy)
    ),
    rest.get('/system/sagas', handler(handlers['sagaList'], schema.SagaListParams, null)),
    rest.get(
      '/system/sagas/:sagaId',
      handler(handlers['sagaView'], schema.SagaViewParams, null)
    ),
    rest.get('/system/silos', handler(handlers['siloList'], schema.SiloListParams, null)),
    rest.post('/system/silos', handler(handlers['siloCreate'], null, schema.SiloCreate)),
    rest.get(
      '/system/silos/:siloName',
      handler(handlers['siloView'], schema.SiloViewParams, null)
    ),
    rest.delete(
      '/system/silos/:siloName',
      handler(handlers['siloDelete'], schema.SiloDeleteParams, null)
    ),
    rest.get(
      '/system/silos/:siloName/identity-providers',
      handler(
        handlers['siloIdentityProviderList'],
        schema.SiloIdentityProviderListParams,
        null
      )
    ),
    rest.post(
      '/system/silos/:siloName/identity-providers/saml',
      handler(
        handlers['samlIdentityProviderCreate'],
        schema.SamlIdentityProviderCreateParams,
        schema.SamlIdentityProviderCreate
      )
    ),
    rest.get(
      '/system/silos/:siloName/identity-providers/saml/:providerName',
      handler(
        handlers['samlIdentityProviderView'],
        schema.SamlIdentityProviderViewParams,
        null
      )
    ),
    rest.get(
      '/system/silos/:siloName/policy',
      handler(handlers['siloPolicyView'], schema.SiloPolicyViewParams, null)
    ),
    rest.put(
      '/system/silos/:siloName/policy',
      handler(
        handlers['siloPolicyUpdate'],
        schema.SiloPolicyUpdateParams,
        schema.SiloRolePolicy
      )
    ),
    rest.post('/system/updates/refresh', handler(handlers['updatesRefresh'], null, null)),
    rest.get(
      '/system/user',
      handler(handlers['systemUserList'], schema.SystemUserListParams, null)
    ),
    rest.get(
      '/system/user/:userName',
      handler(handlers['systemUserView'], schema.SystemUserViewParams, null)
    ),
    rest.get(
      '/timeseries/schema',
      handler(handlers['timeseriesSchemaGet'], schema.TimeseriesSchemaGetParams, null)
    ),
    rest.get('/users', handler(handlers['userList'], schema.UserListParams, null)),
  ]
}
