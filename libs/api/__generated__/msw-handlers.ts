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
  diskViewById: (params: { path: Api.DiskViewByIdPathParams }) => HandlerResult<Api.Disk>
  /** `GET /by-id/images/:id` */
  imageViewById: (params: { path: Api.ImageViewByIdPathParams }) => HandlerResult<Api.Image>
  /** `GET /by-id/instances/:id` */
  instanceViewById: (params: {
    path: Api.InstanceViewByIdPathParams
  }) => HandlerResult<Api.Instance>
  /** `GET /by-id/network-interfaces/:id` */
  instanceNetworkInterfaceViewById: (params: {
    path: Api.InstanceNetworkInterfaceViewByIdPathParams
  }) => HandlerResult<Api.NetworkInterface>
  /** `GET /by-id/organizations/:id` */
  organizationViewById: (params: {
    path: Api.OrganizationViewByIdPathParams
  }) => HandlerResult<Api.Organization>
  /** `GET /by-id/projects/:id` */
  projectViewById: (params: {
    path: Api.ProjectViewByIdPathParams
  }) => HandlerResult<Api.Project>
  /** `GET /by-id/snapshots/:id` */
  snapshotViewById: (params: {
    path: Api.SnapshotViewByIdPathParams
  }) => HandlerResult<Api.Snapshot>
  /** `GET /by-id/vpc-router-routes/:id` */
  vpcRouterRouteViewById: (params: {
    path: Api.VpcRouterRouteViewByIdPathParams
  }) => HandlerResult<Api.RouterRoute>
  /** `GET /by-id/vpc-routers/:id` */
  vpcRouterViewById: (params: {
    path: Api.VpcRouterViewByIdPathParams
  }) => HandlerResult<Api.VpcRouter>
  /** `GET /by-id/vpc-subnets/:id` */
  vpcSubnetViewById: (params: {
    path: Api.VpcSubnetViewByIdPathParams
  }) => HandlerResult<Api.VpcSubnet>
  /** `GET /by-id/vpcs/:id` */
  vpcViewById: (params: { path: Api.VpcViewByIdPathParams }) => HandlerResult<Api.Vpc>
  /** `POST /device/auth` */
  deviceAuthRequest: () => StatusCode
  /** `POST /device/confirm` */
  deviceAuthConfirm: (params: { body: Json<Api.DeviceAuthVerify> }) => StatusCode
  /** `POST /device/token` */
  deviceAccessToken: () => StatusCode
  /** `GET /groups` */
  groupList: (params: {
    query: Api.GroupListQueryParams
  }) => HandlerResult<Api.GroupResultsPage>
  /** `POST /login` */
  loginSpoof: (params: { body: Json<Api.SpoofLoginBody> }) => StatusCode
  /** `POST /login/:siloName/local` */
  loginLocal: (params: {
    path: Api.LoginLocalPathParams
    body: Json<Api.UsernamePasswordCredentials>
  }) => StatusCode
  /** `GET /login/:siloName/saml/:providerName` */
  loginSamlBegin: (params: { path: Api.LoginSamlBeginPathParams }) => StatusCode
  /** `POST /login/:siloName/saml/:providerName` */
  loginSaml: (params: { path: Api.LoginSamlPathParams }) => StatusCode
  /** `POST /logout` */
  logout: () => StatusCode
  /** `GET /organizations` */
  organizationList: (params: {
    query: Api.OrganizationListQueryParams
  }) => HandlerResult<Api.OrganizationResultsPage>
  /** `POST /organizations` */
  organizationCreate: (params: {
    body: Json<Api.OrganizationCreate>
  }) => HandlerResult<Api.Organization>
  /** `GET /organizations/:orgName` */
  organizationView: (params: {
    path: Api.OrganizationViewPathParams
  }) => HandlerResult<Api.Organization>
  /** `PUT /organizations/:orgName` */
  organizationUpdate: (params: {
    path: Api.OrganizationUpdatePathParams
    body: Json<Api.OrganizationUpdate>
  }) => HandlerResult<Api.Organization>
  /** `DELETE /organizations/:orgName` */
  organizationDelete: (params: { path: Api.OrganizationDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/policy` */
  organizationPolicyView: (params: {
    path: Api.OrganizationPolicyViewPathParams
  }) => HandlerResult<Api.OrganizationRolePolicy>
  /** `PUT /organizations/:orgName/policy` */
  organizationPolicyUpdate: (params: {
    path: Api.OrganizationPolicyUpdatePathParams
    body: Json<Api.OrganizationRolePolicy>
  }) => HandlerResult<Api.OrganizationRolePolicy>
  /** `GET /organizations/:orgName/projects` */
  projectList: (params: {
    path: Api.ProjectListPathParams
    query: Api.ProjectListQueryParams
  }) => HandlerResult<Api.ProjectResultsPage>
  /** `POST /organizations/:orgName/projects` */
  projectCreate: (params: {
    path: Api.ProjectCreatePathParams
    body: Json<Api.ProjectCreate>
  }) => HandlerResult<Api.Project>
  /** `GET /organizations/:orgName/projects/:projectName` */
  projectView: (params: { path: Api.ProjectViewPathParams }) => HandlerResult<Api.Project>
  /** `PUT /organizations/:orgName/projects/:projectName` */
  projectUpdate: (params: {
    path: Api.ProjectUpdatePathParams
    body: Json<Api.ProjectUpdate>
  }) => HandlerResult<Api.Project>
  /** `DELETE /organizations/:orgName/projects/:projectName` */
  projectDelete: (params: { path: Api.ProjectDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/disks` */
  diskList: (params: {
    path: Api.DiskListPathParams
    query: Api.DiskListQueryParams
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/disks` */
  diskCreate: (params: {
    path: Api.DiskCreatePathParams
    body: Json<Api.DiskCreate>
  }) => HandlerResult<Api.Disk>
  /** `GET /organizations/:orgName/projects/:projectName/disks/:diskName` */
  diskView: (params: { path: Api.DiskViewPathParams }) => HandlerResult<Api.Disk>
  /** `DELETE /organizations/:orgName/projects/:projectName/disks/:diskName` */
  diskDelete: (params: { path: Api.DiskDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/disks/:diskName/metrics/:metricName` */
  diskMetricsList: (params: {
    path: Api.DiskMetricsListPathParams
    query: Api.DiskMetricsListQueryParams
  }) => HandlerResult<Api.MeasurementResultsPage>
  /** `GET /organizations/:orgName/projects/:projectName/images` */
  imageList: (params: {
    path: Api.ImageListPathParams
    query: Api.ImageListQueryParams
  }) => HandlerResult<Api.ImageResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/images` */
  imageCreate: (params: {
    path: Api.ImageCreatePathParams
    body: Json<Api.ImageCreate>
  }) => HandlerResult<Api.Image>
  /** `GET /organizations/:orgName/projects/:projectName/images/:imageName` */
  imageView: (params: { path: Api.ImageViewPathParams }) => HandlerResult<Api.Image>
  /** `DELETE /organizations/:orgName/projects/:projectName/images/:imageName` */
  imageDelete: (params: { path: Api.ImageDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/instances` */
  instanceList: (params: {
    path: Api.InstanceListPathParams
    query: Api.InstanceListQueryParams
  }) => HandlerResult<Api.InstanceResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances` */
  instanceCreate: (params: {
    path: Api.InstanceCreatePathParams
    body: Json<Api.InstanceCreate>
  }) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName` */
  instanceView: (params: {
    path: Api.InstanceViewPathParams
  }) => HandlerResult<Api.Instance>
  /** `DELETE /organizations/:orgName/projects/:projectName/instances/:instanceName` */
  instanceDelete: (params: { path: Api.InstanceDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/disks` */
  instanceDiskList: (params: {
    path: Api.InstanceDiskListPathParams
    query: Api.InstanceDiskListQueryParams
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/disks/attach` */
  instanceDiskAttach: (params: {
    path: Api.InstanceDiskAttachPathParams
    body: Json<Api.DiskIdentifier>
  }) => HandlerResult<Api.Disk>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/disks/detach` */
  instanceDiskDetach: (params: {
    path: Api.InstanceDiskDetachPathParams
    body: Json<Api.DiskIdentifier>
  }) => HandlerResult<Api.Disk>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/external-ips` */
  instanceExternalIpList: (params: {
    path: Api.InstanceExternalIpListPathParams
  }) => HandlerResult<Api.ExternalIpResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/migrate` */
  instanceMigrate: (params: {
    path: Api.InstanceMigratePathParams
    body: Json<Api.InstanceMigrate>
  }) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces` */
  instanceNetworkInterfaceList: (params: {
    path: Api.InstanceNetworkInterfaceListPathParams
    query: Api.InstanceNetworkInterfaceListQueryParams
  }) => HandlerResult<Api.NetworkInterfaceResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces` */
  instanceNetworkInterfaceCreate: (params: {
    path: Api.InstanceNetworkInterfaceCreatePathParams
    body: Json<Api.NetworkInterfaceCreate>
  }) => HandlerResult<Api.NetworkInterface>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceView: (params: {
    path: Api.InstanceNetworkInterfaceViewPathParams
  }) => HandlerResult<Api.NetworkInterface>
  /** `PUT /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceUpdate: (params: {
    path: Api.InstanceNetworkInterfaceUpdatePathParams
    body: Json<Api.NetworkInterfaceUpdate>
  }) => HandlerResult<Api.NetworkInterface>
  /** `DELETE /organizations/:orgName/projects/:projectName/instances/:instanceName/network-interfaces/:interfaceName` */
  instanceNetworkInterfaceDelete: (params: {
    path: Api.InstanceNetworkInterfaceDeletePathParams
  }) => StatusCode
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/reboot` */
  instanceReboot: (params: {
    path: Api.InstanceRebootPathParams
  }) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console` */
  instanceSerialConsole: (params: {
    path: Api.InstanceSerialConsolePathParams
    query: Api.InstanceSerialConsoleQueryParams
  }) => HandlerResult<Api.InstanceSerialConsoleData>
  /** `GET /organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console/stream` */
  instanceSerialConsoleStream: (params: {
    path: Api.InstanceSerialConsoleStreamPathParams
  }) => StatusCode
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/start` */
  instanceStart: (params: {
    path: Api.InstanceStartPathParams
  }) => HandlerResult<Api.Instance>
  /** `POST /organizations/:orgName/projects/:projectName/instances/:instanceName/stop` */
  instanceStop: (params: {
    path: Api.InstanceStopPathParams
  }) => HandlerResult<Api.Instance>
  /** `GET /organizations/:orgName/projects/:projectName/policy` */
  projectPolicyView: (params: {
    path: Api.ProjectPolicyViewPathParams
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `PUT /organizations/:orgName/projects/:projectName/policy` */
  projectPolicyUpdate: (params: {
    path: Api.ProjectPolicyUpdatePathParams
    body: Json<Api.ProjectRolePolicy>
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `GET /organizations/:orgName/projects/:projectName/snapshots` */
  snapshotList: (params: {
    path: Api.SnapshotListPathParams
    query: Api.SnapshotListQueryParams
  }) => HandlerResult<Api.SnapshotResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/snapshots` */
  snapshotCreate: (params: {
    path: Api.SnapshotCreatePathParams
    body: Json<Api.SnapshotCreate>
  }) => HandlerResult<Api.Snapshot>
  /** `GET /organizations/:orgName/projects/:projectName/snapshots/:snapshotName` */
  snapshotView: (params: {
    path: Api.SnapshotViewPathParams
  }) => HandlerResult<Api.Snapshot>
  /** `DELETE /organizations/:orgName/projects/:projectName/snapshots/:snapshotName` */
  snapshotDelete: (params: { path: Api.SnapshotDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs` */
  vpcList: (params: {
    path: Api.VpcListPathParams
    query: Api.VpcListQueryParams
  }) => HandlerResult<Api.VpcResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs` */
  vpcCreate: (params: {
    path: Api.VpcCreatePathParams
    body: Json<Api.VpcCreate>
  }) => HandlerResult<Api.Vpc>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcView: (params: { path: Api.VpcViewPathParams }) => HandlerResult<Api.Vpc>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcUpdate: (params: {
    path: Api.VpcUpdatePathParams
    body: Json<Api.VpcUpdate>
  }) => HandlerResult<Api.Vpc>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName` */
  vpcDelete: (params: { path: Api.VpcDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules` */
  vpcFirewallRulesView: (params: {
    path: Api.VpcFirewallRulesViewPathParams
  }) => HandlerResult<Api.VpcFirewallRules>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/firewall/rules` */
  vpcFirewallRulesUpdate: (params: {
    path: Api.VpcFirewallRulesUpdatePathParams
    body: Json<Api.VpcFirewallRuleUpdateParams>
  }) => HandlerResult<Api.VpcFirewallRules>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers` */
  vpcRouterList: (params: {
    path: Api.VpcRouterListPathParams
    query: Api.VpcRouterListQueryParams
  }) => HandlerResult<Api.VpcRouterResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers` */
  vpcRouterCreate: (params: {
    path: Api.VpcRouterCreatePathParams
    body: Json<Api.VpcRouterCreate>
  }) => HandlerResult<Api.VpcRouter>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterView: (params: {
    path: Api.VpcRouterViewPathParams
  }) => HandlerResult<Api.VpcRouter>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterUpdate: (params: {
    path: Api.VpcRouterUpdatePathParams
    body: Json<Api.VpcRouterUpdate>
  }) => HandlerResult<Api.VpcRouter>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName` */
  vpcRouterDelete: (params: { path: Api.VpcRouterDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes` */
  vpcRouterRouteList: (params: {
    path: Api.VpcRouterRouteListPathParams
    query: Api.VpcRouterRouteListQueryParams
  }) => HandlerResult<Api.RouterRouteResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes` */
  vpcRouterRouteCreate: (params: {
    path: Api.VpcRouterRouteCreatePathParams
    body: Json<Api.RouterRouteCreate>
  }) => HandlerResult<Api.RouterRoute>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteView: (params: {
    path: Api.VpcRouterRouteViewPathParams
  }) => HandlerResult<Api.RouterRoute>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteUpdate: (params: {
    path: Api.VpcRouterRouteUpdatePathParams
    body: Json<Api.RouterRouteUpdate>
  }) => HandlerResult<Api.RouterRoute>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName/routers/:routerName/routes/:routeName` */
  vpcRouterRouteDelete: (params: { path: Api.VpcRouterRouteDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets` */
  vpcSubnetList: (params: {
    path: Api.VpcSubnetListPathParams
    query: Api.VpcSubnetListQueryParams
  }) => HandlerResult<Api.VpcSubnetResultsPage>
  /** `POST /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets` */
  vpcSubnetCreate: (params: {
    path: Api.VpcSubnetCreatePathParams
    body: Json<Api.VpcSubnetCreate>
  }) => HandlerResult<Api.VpcSubnet>
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetView: (params: {
    path: Api.VpcSubnetViewPathParams
  }) => HandlerResult<Api.VpcSubnet>
  /** `PUT /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetUpdate: (params: {
    path: Api.VpcSubnetUpdatePathParams
    body: Json<Api.VpcSubnetUpdate>
  }) => HandlerResult<Api.VpcSubnet>
  /** `DELETE /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName` */
  vpcSubnetDelete: (params: { path: Api.VpcSubnetDeletePathParams }) => StatusCode
  /** `GET /organizations/:orgName/projects/:projectName/vpcs/:vpcName/subnets/:subnetName/network-interfaces` */
  vpcSubnetListNetworkInterfaces: (params: {
    path: Api.VpcSubnetListNetworkInterfacesPathParams
    query: Api.VpcSubnetListNetworkInterfacesQueryParams
  }) => HandlerResult<Api.NetworkInterfaceResultsPage>
  /** `GET /policy` */
  policyView: () => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /policy` */
  policyUpdate: (params: {
    body: Json<Api.SiloRolePolicy>
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `GET /roles` */
  roleList: (params: {
    query: Api.RoleListQueryParams
  }) => HandlerResult<Api.RoleResultsPage>
  /** `GET /roles/:roleName` */
  roleView: (params: { path: Api.RoleViewPathParams }) => HandlerResult<Api.Role>
  /** `GET /session/me` */
  sessionMe: () => HandlerResult<Api.User>
  /** `GET /session/me/groups` */
  sessionMeGroups: (params: {
    query: Api.SessionMeGroupsQueryParams
  }) => HandlerResult<Api.GroupResultsPage>
  /** `GET /session/me/sshkeys` */
  sessionSshkeyList: (params: {
    query: Api.SessionSshkeyListQueryParams
  }) => HandlerResult<Api.SshKeyResultsPage>
  /** `POST /session/me/sshkeys` */
  sessionSshkeyCreate: (params: {
    body: Json<Api.SshKeyCreate>
  }) => HandlerResult<Api.SshKey>
  /** `GET /session/me/sshkeys/:sshKeyName` */
  sessionSshkeyView: (params: {
    path: Api.SessionSshkeyViewPathParams
  }) => HandlerResult<Api.SshKey>
  /** `DELETE /session/me/sshkeys/:sshKeyName` */
  sessionSshkeyDelete: (params: { path: Api.SessionSshkeyDeletePathParams }) => StatusCode
  /** `GET /system/by-id/images/:id` */
  systemImageViewById: (params: {
    path: Api.SystemImageViewByIdPathParams
  }) => HandlerResult<Api.GlobalImage>
  /** `GET /system/by-id/ip-pools/:id` */
  ipPoolViewById: (params: {
    path: Api.IpPoolViewByIdPathParams
  }) => HandlerResult<Api.IpPool>
  /** `GET /system/by-id/silos/:id` */
  siloViewById: (params: { path: Api.SiloViewByIdPathParams }) => HandlerResult<Api.Silo>
  /** `GET /system/certificates` */
  certificateList: (params: {
    query: Api.CertificateListQueryParams
  }) => HandlerResult<Api.CertificateResultsPage>
  /** `POST /system/certificates` */
  certificateCreate: (params: {
    body: Json<Api.CertificateCreate>
  }) => HandlerResult<Api.Certificate>
  /** `GET /system/certificates/:certificate` */
  certificateView: (params: {
    path: Api.CertificateViewPathParams
  }) => HandlerResult<Api.Certificate>
  /** `DELETE /system/certificates/:certificate` */
  certificateDelete: (params: { path: Api.CertificateDeletePathParams }) => StatusCode
  /** `GET /system/hardware/disks` */
  physicalDiskList: (params: {
    query: Api.PhysicalDiskListQueryParams
  }) => HandlerResult<Api.PhysicalDiskResultsPage>
  /** `GET /system/hardware/racks` */
  rackList: (params: {
    query: Api.RackListQueryParams
  }) => HandlerResult<Api.RackResultsPage>
  /** `GET /system/hardware/racks/:rackId` */
  rackView: (params: { path: Api.RackViewPathParams }) => HandlerResult<Api.Rack>
  /** `GET /system/hardware/sleds` */
  sledList: (params: {
    query: Api.SledListQueryParams
  }) => HandlerResult<Api.SledResultsPage>
  /** `GET /system/hardware/sleds/:sledId` */
  sledView: (params: { path: Api.SledViewPathParams }) => HandlerResult<Api.Sled>
  /** `GET /system/hardware/sleds/:sledId/disks` */
  sledPhysicalDiskList: (params: {
    path: Api.SledPhysicalDiskListPathParams
    query: Api.SledPhysicalDiskListQueryParams
  }) => HandlerResult<Api.PhysicalDiskResultsPage>
  /** `GET /system/images` */
  systemImageList: (params: {
    query: Api.SystemImageListQueryParams
  }) => HandlerResult<Api.GlobalImageResultsPage>
  /** `POST /system/images` */
  systemImageCreate: (params: {
    body: Json<Api.GlobalImageCreate>
  }) => HandlerResult<Api.GlobalImage>
  /** `GET /system/images/:imageName` */
  systemImageView: (params: {
    path: Api.SystemImageViewPathParams
  }) => HandlerResult<Api.GlobalImage>
  /** `DELETE /system/images/:imageName` */
  systemImageDelete: (params: { path: Api.SystemImageDeletePathParams }) => StatusCode
  /** `GET /system/ip-pools` */
  ipPoolList: (params: {
    query: Api.IpPoolListQueryParams
  }) => HandlerResult<Api.IpPoolResultsPage>
  /** `POST /system/ip-pools` */
  ipPoolCreate: (params: { body: Json<Api.IpPoolCreate> }) => HandlerResult<Api.IpPool>
  /** `GET /system/ip-pools/:poolName` */
  ipPoolView: (params: { path: Api.IpPoolViewPathParams }) => HandlerResult<Api.IpPool>
  /** `PUT /system/ip-pools/:poolName` */
  ipPoolUpdate: (params: {
    path: Api.IpPoolUpdatePathParams
    body: Json<Api.IpPoolUpdate>
  }) => HandlerResult<Api.IpPool>
  /** `DELETE /system/ip-pools/:poolName` */
  ipPoolDelete: (params: { path: Api.IpPoolDeletePathParams }) => StatusCode
  /** `GET /system/ip-pools/:poolName/ranges` */
  ipPoolRangeList: (params: {
    path: Api.IpPoolRangeListPathParams
    query: Api.IpPoolRangeListQueryParams
  }) => HandlerResult<Api.IpPoolRangeResultsPage>
  /** `POST /system/ip-pools/:poolName/ranges/add` */
  ipPoolRangeAdd: (params: {
    path: Api.IpPoolRangeAddPathParams
    body: Json<Api.IpRange>
  }) => HandlerResult<Api.IpPoolRange>
  /** `POST /system/ip-pools/:poolName/ranges/remove` */
  ipPoolRangeRemove: (params: {
    path: Api.IpPoolRangeRemovePathParams
    body: Json<Api.IpRange>
  }) => StatusCode
  /** `GET /system/ip-pools-service` */
  ipPoolServiceView: () => HandlerResult<Api.IpPool>
  /** `GET /system/ip-pools-service/ranges` */
  ipPoolServiceRangeList: (params: {
    query: Api.IpPoolServiceRangeListQueryParams
  }) => HandlerResult<Api.IpPoolRangeResultsPage>
  /** `POST /system/ip-pools-service/ranges/add` */
  ipPoolServiceRangeAdd: (params: {
    body: Json<Api.IpRange>
  }) => HandlerResult<Api.IpPoolRange>
  /** `POST /system/ip-pools-service/ranges/remove` */
  ipPoolServiceRangeRemove: (params: { body: Json<Api.IpRange> }) => StatusCode
  /** `GET /system/metrics/:metricName` */
  systemMetric: (params: {
    path: Api.SystemMetricPathParams
    query: Api.SystemMetricQueryParams
  }) => HandlerResult<Api.MeasurementResultsPage>
  /** `GET /system/policy` */
  systemPolicyView: () => HandlerResult<Api.FleetRolePolicy>
  /** `PUT /system/policy` */
  systemPolicyUpdate: (params: {
    body: Json<Api.FleetRolePolicy>
  }) => HandlerResult<Api.FleetRolePolicy>
  /** `GET /system/sagas` */
  sagaList: (params: {
    query: Api.SagaListQueryParams
  }) => HandlerResult<Api.SagaResultsPage>
  /** `GET /system/sagas/:sagaId` */
  sagaView: (params: { path: Api.SagaViewPathParams }) => HandlerResult<Api.Saga>
  /** `GET /system/silos` */
  siloList: (params: {
    query: Api.SiloListQueryParams
  }) => HandlerResult<Api.SiloResultsPage>
  /** `POST /system/silos` */
  siloCreate: (params: { body: Json<Api.SiloCreate> }) => HandlerResult<Api.Silo>
  /** `GET /system/silos/:siloName` */
  siloView: (params: { path: Api.SiloViewPathParams }) => HandlerResult<Api.Silo>
  /** `DELETE /system/silos/:siloName` */
  siloDelete: (params: { path: Api.SiloDeletePathParams }) => StatusCode
  /** `GET /system/silos/:siloName/identity-providers` */
  siloIdentityProviderList: (params: {
    path: Api.SiloIdentityProviderListPathParams
    query: Api.SiloIdentityProviderListQueryParams
  }) => HandlerResult<Api.IdentityProviderResultsPage>
  /** `POST /system/silos/:siloName/identity-providers/local/users` */
  localIdpUserCreate: (params: {
    path: Api.LocalIdpUserCreatePathParams
    body: Json<Api.UserCreate>
  }) => HandlerResult<Api.User>
  /** `DELETE /system/silos/:siloName/identity-providers/local/users/:userId` */
  localIdpUserDelete: (params: { path: Api.LocalIdpUserDeletePathParams }) => StatusCode
  /** `POST /system/silos/:siloName/identity-providers/local/users/:userId/set-password` */
  localIdpUserSetPassword: (params: {
    path: Api.LocalIdpUserSetPasswordPathParams
    body: Json<Api.UserPassword>
  }) => StatusCode
  /** `POST /system/silos/:siloName/identity-providers/saml` */
  samlIdentityProviderCreate: (params: {
    path: Api.SamlIdentityProviderCreatePathParams
    body: Json<Api.SamlIdentityProviderCreate>
  }) => HandlerResult<Api.SamlIdentityProvider>
  /** `GET /system/silos/:siloName/identity-providers/saml/:providerName` */
  samlIdentityProviderView: (params: {
    path: Api.SamlIdentityProviderViewPathParams
  }) => HandlerResult<Api.SamlIdentityProvider>
  /** `GET /system/silos/:siloName/policy` */
  siloPolicyView: (params: {
    path: Api.SiloPolicyViewPathParams
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /system/silos/:siloName/policy` */
  siloPolicyUpdate: (params: {
    path: Api.SiloPolicyUpdatePathParams
    body: Json<Api.SiloRolePolicy>
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `GET /system/silos/:siloName/users/all` */
  siloUsersList: (params: {
    path: Api.SiloUsersListPathParams
    query: Api.SiloUsersListQueryParams
  }) => HandlerResult<Api.UserResultsPage>
  /** `GET /system/silos/:siloName/users/id/:userId` */
  siloUserView: (params: { path: Api.SiloUserViewPathParams }) => HandlerResult<Api.User>
  /** `GET /system/user` */
  systemUserList: (params: {
    query: Api.SystemUserListQueryParams
  }) => HandlerResult<Api.UserBuiltinResultsPage>
  /** `GET /system/user/:userName` */
  systemUserView: (params: {
    path: Api.SystemUserViewPathParams
  }) => HandlerResult<Api.UserBuiltin>
  /** `GET /timeseries/schema` */
  timeseriesSchemaGet: (params: {
    query: Api.TimeseriesSchemaGetQueryParams
  }) => HandlerResult<Api.TimeseriesSchemaResultsPage>
  /** `GET /users` */
  userList: (params: {
    query: Api.UserListQueryParams
  }) => HandlerResult<Api.UserResultsPage>
  /** `GET /v1/disks` */
  diskListV1: (params: {
    query: Api.DiskListV1QueryParams
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /v1/disks` */
  diskCreateV1: (params: {
    query: Api.DiskCreateV1QueryParams
    body: Json<Api.DiskCreate>
  }) => HandlerResult<Api.Disk>
  /** `GET /v1/disks/:disk` */
  diskViewV1: (params: {
    path: Api.DiskViewV1PathParams
    query: Api.DiskViewV1QueryParams
  }) => HandlerResult<Api.Disk>
  /** `DELETE /v1/disks/:disk` */
  diskDeleteV1: (params: {
    path: Api.DiskDeleteV1PathParams
    query: Api.DiskDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/instances` */
  instanceListV1: (params: {
    query: Api.InstanceListV1QueryParams
  }) => HandlerResult<Api.InstanceResultsPage>
  /** `POST /v1/instances` */
  instanceCreateV1: (params: {
    query: Api.InstanceCreateV1QueryParams
    body: Json<Api.InstanceCreate>
  }) => HandlerResult<Api.Instance>
  /** `GET /v1/instances/:instance` */
  instanceViewV1: (params: {
    path: Api.InstanceViewV1PathParams
    query: Api.InstanceViewV1QueryParams
  }) => HandlerResult<Api.Instance>
  /** `DELETE /v1/instances/:instance` */
  instanceDeleteV1: (params: {
    path: Api.InstanceDeleteV1PathParams
    query: Api.InstanceDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/instances/:instance/disks` */
  instanceDiskListV1: (params: {
    path: Api.InstanceDiskListV1PathParams
    query: Api.InstanceDiskListV1QueryParams
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /v1/instances/:instance/disks/attach` */
  instanceDiskAttachV1: (params: {
    path: Api.InstanceDiskAttachV1PathParams
    query: Api.InstanceDiskAttachV1QueryParams
    body: Json<Api.DiskPath>
  }) => HandlerResult<Api.Disk>
  /** `POST /v1/instances/:instance/disks/detach` */
  instanceDiskDetachV1: (params: {
    path: Api.InstanceDiskDetachV1PathParams
    query: Api.InstanceDiskDetachV1QueryParams
    body: Json<Api.DiskPath>
  }) => HandlerResult<Api.Disk>
  /** `POST /v1/instances/:instance/migrate` */
  instanceMigrateV1: (params: {
    path: Api.InstanceMigrateV1PathParams
    query: Api.InstanceMigrateV1QueryParams
    body: Json<Api.InstanceMigrate>
  }) => HandlerResult<Api.Instance>
  /** `POST /v1/instances/:instance/reboot` */
  instanceRebootV1: (params: {
    path: Api.InstanceRebootV1PathParams
    query: Api.InstanceRebootV1QueryParams
  }) => HandlerResult<Api.Instance>
  /** `GET /v1/instances/:instance/serial-console` */
  instanceSerialConsoleV1: (params: {
    path: Api.InstanceSerialConsoleV1PathParams
    query: Api.InstanceSerialConsoleV1QueryParams
  }) => HandlerResult<Api.InstanceSerialConsoleData>
  /** `GET /v1/instances/:instance/serial-console/stream` */
  instanceSerialConsoleStreamV1: (params: {
    path: Api.InstanceSerialConsoleStreamV1PathParams
    query: Api.InstanceSerialConsoleStreamV1QueryParams
  }) => StatusCode
  /** `POST /v1/instances/:instance/start` */
  instanceStartV1: (params: {
    path: Api.InstanceStartV1PathParams
    query: Api.InstanceStartV1QueryParams
  }) => HandlerResult<Api.Instance>
  /** `POST /v1/instances/:instance/stop` */
  instanceStopV1: (params: {
    path: Api.InstanceStopV1PathParams
    query: Api.InstanceStopV1QueryParams
  }) => HandlerResult<Api.Instance>
  /** `GET /v1/network-interfaces` */
  instanceNetworkInterfaceListV1: (params: {
    query: Api.InstanceNetworkInterfaceListV1QueryParams
  }) => HandlerResult<Api.NetworkInterfaceResultsPage>
  /** `POST /v1/network-interfaces` */
  instanceNetworkInterfaceCreateV1: (params: {
    query: Api.InstanceNetworkInterfaceCreateV1QueryParams
    body: Json<Api.NetworkInterfaceCreate>
  }) => HandlerResult<Api.NetworkInterface>
  /** `GET /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceViewV1: (params: {
    path: Api.InstanceNetworkInterfaceViewV1PathParams
    query: Api.InstanceNetworkInterfaceViewV1QueryParams
  }) => HandlerResult<Api.NetworkInterface>
  /** `PUT /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceUpdateV1: (params: {
    path: Api.InstanceNetworkInterfaceUpdateV1PathParams
    query: Api.InstanceNetworkInterfaceUpdateV1QueryParams
    body: Json<Api.NetworkInterfaceUpdate>
  }) => HandlerResult<Api.NetworkInterface>
  /** `DELETE /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceDeleteV1: (params: {
    path: Api.InstanceNetworkInterfaceDeleteV1PathParams
    query: Api.InstanceNetworkInterfaceDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/organizations` */
  organizationListV1: (params: {
    query: Api.OrganizationListV1QueryParams
  }) => HandlerResult<Api.OrganizationResultsPage>
  /** `POST /v1/organizations` */
  organizationCreateV1: (params: {
    body: Json<Api.OrganizationCreate>
  }) => HandlerResult<Api.Organization>
  /** `GET /v1/organizations/:organization` */
  organizationViewV1: (params: {
    path: Api.OrganizationViewV1PathParams
  }) => HandlerResult<Api.Organization>
  /** `PUT /v1/organizations/:organization` */
  organizationUpdateV1: (params: {
    path: Api.OrganizationUpdateV1PathParams
    body: Json<Api.OrganizationUpdate>
  }) => HandlerResult<Api.Organization>
  /** `DELETE /v1/organizations/:organization` */
  organizationDeleteV1: (params: { path: Api.OrganizationDeleteV1PathParams }) => StatusCode
  /** `GET /v1/organizations/:organization/policy` */
  organizationPolicyViewV1: (params: {
    path: Api.OrganizationPolicyViewV1PathParams
  }) => HandlerResult<Api.OrganizationRolePolicy>
  /** `PUT /v1/organizations/:organization/policy` */
  organizationPolicyUpdateV1: (params: {
    path: Api.OrganizationPolicyUpdateV1PathParams
    body: Json<Api.OrganizationRolePolicy>
  }) => HandlerResult<Api.OrganizationRolePolicy>
  /** `GET /v1/policy` */
  policyViewV1: () => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /v1/policy` */
  policyUpdateV1: (params: {
    body: Json<Api.SiloRolePolicy>
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `GET /v1/projects` */
  projectListV1: (params: {
    query: Api.ProjectListV1QueryParams
  }) => HandlerResult<Api.ProjectResultsPage>
  /** `POST /v1/projects` */
  projectCreateV1: (params: {
    query: Api.ProjectCreateV1QueryParams
    body: Json<Api.ProjectCreate>
  }) => HandlerResult<Api.Project>
  /** `GET /v1/projects/:project` */
  projectViewV1: (params: {
    path: Api.ProjectViewV1PathParams
    query: Api.ProjectViewV1QueryParams
  }) => HandlerResult<Api.Project>
  /** `PUT /v1/projects/:project` */
  projectUpdateV1: (params: {
    path: Api.ProjectUpdateV1PathParams
    query: Api.ProjectUpdateV1QueryParams
    body: Json<Api.ProjectUpdate>
  }) => HandlerResult<Api.Project>
  /** `DELETE /v1/projects/:project` */
  projectDeleteV1: (params: {
    path: Api.ProjectDeleteV1PathParams
    query: Api.ProjectDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/projects/:project/policy` */
  projectPolicyViewV1: (params: {
    path: Api.ProjectPolicyViewV1PathParams
    query: Api.ProjectPolicyViewV1QueryParams
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `PUT /v1/projects/:project/policy` */
  projectPolicyUpdateV1: (params: {
    path: Api.ProjectPolicyUpdateV1PathParams
    query: Api.ProjectPolicyUpdateV1QueryParams
    body: Json<Api.ProjectRolePolicy>
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `GET /v1/snapshots` */
  snapshotListV1: (params: {
    query: Api.SnapshotListV1QueryParams
  }) => HandlerResult<Api.SnapshotResultsPage>
  /** `POST /v1/snapshots` */
  snapshotCreateV1: (params: {
    query: Api.SnapshotCreateV1QueryParams
    body: Json<Api.SnapshotCreate>
  }) => HandlerResult<Api.Snapshot>
  /** `GET /v1/snapshots/:snapshot` */
  snapshotViewV1: (params: {
    path: Api.SnapshotViewV1PathParams
    query: Api.SnapshotViewV1QueryParams
  }) => HandlerResult<Api.Snapshot>
  /** `DELETE /v1/snapshots/:snapshot` */
  snapshotDeleteV1: (params: {
    path: Api.SnapshotDeleteV1PathParams
    query: Api.SnapshotDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/system/certificates` */
  certificateListV1: (params: {
    query: Api.CertificateListV1QueryParams
  }) => HandlerResult<Api.CertificateResultsPage>
  /** `POST /v1/system/certificates` */
  certificateCreateV1: (params: {
    body: Json<Api.CertificateCreate>
  }) => HandlerResult<Api.Certificate>
  /** `GET /v1/system/certificates/:certificate` */
  certificateViewV1: (params: {
    path: Api.CertificateViewV1PathParams
  }) => HandlerResult<Api.Certificate>
  /** `DELETE /v1/system/certificates/:certificate` */
  certificateDeleteV1: (params: { path: Api.CertificateDeleteV1PathParams }) => StatusCode
  /** `GET /v1/system/hardware/disks` */
  physicalDiskListV1: (params: {
    query: Api.PhysicalDiskListV1QueryParams
  }) => HandlerResult<Api.PhysicalDiskResultsPage>
  /** `GET /v1/system/hardware/racks` */
  rackListV1: (params: {
    query: Api.RackListV1QueryParams
  }) => HandlerResult<Api.RackResultsPage>
  /** `GET /v1/system/hardware/racks/:rackId` */
  rackViewV1: (params: { path: Api.RackViewV1PathParams }) => HandlerResult<Api.Rack>
  /** `GET /v1/system/hardware/sleds` */
  sledListV1: (params: {
    query: Api.SledListV1QueryParams
  }) => HandlerResult<Api.SledResultsPage>
  /** `GET /v1/system/hardware/sleds/:sledId` */
  sledViewV1: (params: { path: Api.SledViewV1PathParams }) => HandlerResult<Api.Sled>
  /** `GET /v1/system/hardware/sleds/:sledId/disks` */
  sledPhysicalDiskListV1: (params: {
    path: Api.SledPhysicalDiskListV1PathParams
    query: Api.SledPhysicalDiskListV1QueryParams
  }) => HandlerResult<Api.PhysicalDiskResultsPage>
  /** `GET /v1/system/policy` */
  systemPolicyViewV1: () => HandlerResult<Api.FleetRolePolicy>
  /** `PUT /v1/system/policy` */
  systemPolicyUpdateV1: (params: {
    body: Json<Api.FleetRolePolicy>
  }) => HandlerResult<Api.FleetRolePolicy>
  /** `GET /v1/system/sagas` */
  sagaListV1: (params: {
    query: Api.SagaListV1QueryParams
  }) => HandlerResult<Api.SagaResultsPage>
  /** `GET /v1/system/sagas/:sagaId` */
  sagaViewV1: (params: { path: Api.SagaViewV1PathParams }) => HandlerResult<Api.Saga>
  /** `GET /v1/system/update/components` */
  systemComponentVersionList: (params: {
    query: Api.SystemComponentVersionListQueryParams
  }) => HandlerResult<Api.UpdateableComponentResultsPage>
  /** `GET /v1/system/update/deployments` */
  updateDeploymentsList: (params: {
    query: Api.UpdateDeploymentsListQueryParams
  }) => HandlerResult<Api.UpdateDeploymentResultsPage>
  /** `GET /v1/system/update/deployments/:id` */
  updateDeploymentView: (params: {
    path: Api.UpdateDeploymentViewPathParams
  }) => HandlerResult<Api.UpdateDeployment>
  /** `POST /v1/system/update/refresh` */
  systemUpdateRefresh: () => StatusCode
  /** `POST /v1/system/update/start` */
  systemUpdateStart: (params: {
    body: Json<Api.SystemUpdateStart>
  }) => HandlerResult<Api.UpdateDeployment>
  /** `POST /v1/system/update/stop` */
  systemUpdateStop: () => StatusCode
  /** `GET /v1/system/update/updates` */
  systemUpdateList: (params: {
    query: Api.SystemUpdateListQueryParams
  }) => HandlerResult<Api.SystemUpdateResultsPage>
  /** `GET /v1/system/update/updates/:version` */
  systemUpdateView: (params: {
    path: Api.SystemUpdateViewPathParams
  }) => HandlerResult<Api.SystemUpdate>
  /** `GET /v1/system/update/updates/:version/components` */
  systemUpdateComponentsList: (params: {
    path: Api.SystemUpdateComponentsListPathParams
  }) => HandlerResult<Api.ComponentUpdateResultsPage>
  /** `GET /v1/system/update/version` */
  systemVersion: () => HandlerResult<Api.SystemVersion>
  /** `GET /v1/vpc-router-routes` */
  vpcRouterRouteListV1: (params: {
    query: Api.VpcRouterRouteListV1QueryParams
  }) => HandlerResult<Api.RouterRouteResultsPage>
  /** `POST /v1/vpc-router-routes` */
  vpcRouterRouteCreateV1: (params: {
    query: Api.VpcRouterRouteCreateV1QueryParams
    body: Json<Api.RouterRouteCreate>
  }) => HandlerResult<Api.RouterRoute>
  /** `GET /v1/vpc-router-routes/:route` */
  vpcRouterRouteViewV1: (params: {
    path: Api.VpcRouterRouteViewV1PathParams
    query: Api.VpcRouterRouteViewV1QueryParams
  }) => HandlerResult<Api.RouterRoute>
  /** `PUT /v1/vpc-router-routes/:route` */
  vpcRouterRouteUpdateV1: (params: {
    path: Api.VpcRouterRouteUpdateV1PathParams
    query: Api.VpcRouterRouteUpdateV1QueryParams
    body: Json<Api.RouterRouteUpdate>
  }) => HandlerResult<Api.RouterRoute>
  /** `DELETE /v1/vpc-router-routes/:route` */
  vpcRouterRouteDeleteV1: (params: {
    path: Api.VpcRouterRouteDeleteV1PathParams
    query: Api.VpcRouterRouteDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/vpc-routers` */
  vpcRouterListV1: (params: {
    query: Api.VpcRouterListV1QueryParams
  }) => HandlerResult<Api.VpcRouterResultsPage>
  /** `POST /v1/vpc-routers` */
  vpcRouterCreateV1: (params: {
    query: Api.VpcRouterCreateV1QueryParams
    body: Json<Api.VpcRouterCreate>
  }) => HandlerResult<Api.VpcRouter>
  /** `GET /v1/vpc-routers/:router` */
  vpcRouterViewV1: (params: {
    path: Api.VpcRouterViewV1PathParams
    query: Api.VpcRouterViewV1QueryParams
  }) => HandlerResult<Api.VpcRouter>
  /** `PUT /v1/vpc-routers/:router` */
  vpcRouterUpdateV1: (params: {
    path: Api.VpcRouterUpdateV1PathParams
    query: Api.VpcRouterUpdateV1QueryParams
    body: Json<Api.VpcRouterUpdate>
  }) => HandlerResult<Api.VpcRouter>
  /** `DELETE /v1/vpc-routers/:router` */
  vpcRouterDeleteV1: (params: {
    path: Api.VpcRouterDeleteV1PathParams
    query: Api.VpcRouterDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/vpc-subnets` */
  vpcSubnetListV1: (params: {
    query: Api.VpcSubnetListV1QueryParams
  }) => HandlerResult<Api.VpcSubnetResultsPage>
  /** `POST /v1/vpc-subnets` */
  vpcSubnetCreateV1: (params: {
    query: Api.VpcSubnetCreateV1QueryParams
    body: Json<Api.VpcSubnetCreate>
  }) => HandlerResult<Api.VpcSubnet>
  /** `GET /v1/vpc-subnets/:subnet` */
  vpcSubnetViewV1: (params: {
    path: Api.VpcSubnetViewV1PathParams
    query: Api.VpcSubnetViewV1QueryParams
  }) => HandlerResult<Api.VpcSubnet>
  /** `PUT /v1/vpc-subnets/:subnet` */
  vpcSubnetUpdateV1: (params: {
    path: Api.VpcSubnetUpdateV1PathParams
    query: Api.VpcSubnetUpdateV1QueryParams
    body: Json<Api.VpcSubnetUpdate>
  }) => HandlerResult<Api.VpcSubnet>
  /** `DELETE /v1/vpc-subnets/:subnet` */
  vpcSubnetDeleteV1: (params: {
    path: Api.VpcSubnetDeleteV1PathParams
    query: Api.VpcSubnetDeleteV1QueryParams
  }) => StatusCode
  /** `GET /v1/vpcs` */
  vpcListV1: (params: {
    query: Api.VpcListV1QueryParams
  }) => HandlerResult<Api.VpcResultsPage>
  /** `POST /v1/vpcs` */
  vpcCreateV1: (params: {
    query: Api.VpcCreateV1QueryParams
    body: Json<Api.VpcCreate>
  }) => HandlerResult<Api.Vpc>
  /** `GET /v1/vpcs/:vpc` */
  vpcViewV1: (params: {
    path: Api.VpcViewV1PathParams
    query: Api.VpcViewV1QueryParams
  }) => HandlerResult<Api.Vpc>
  /** `PUT /v1/vpcs/:vpc` */
  vpcUpdateV1: (params: {
    path: Api.VpcUpdateV1PathParams
    query: Api.VpcUpdateV1QueryParams
    body: Json<Api.VpcUpdate>
  }) => HandlerResult<Api.Vpc>
  /** `DELETE /v1/vpcs/:vpc` */
  vpcDeleteV1: (params: {
    path: Api.VpcDeleteV1PathParams
    query: Api.VpcDeleteV1QueryParams
  }) => StatusCode
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

  // if any of the errors come from path params, just 404 — the resource cannot
  // exist if there's no valid name
  const { issues } = result.error
  const status = issues.some((e) => e.path[0] === 'path') ? 404 : 400
  return { paramsErr: json(issues, { status }) }
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
    rest.post(
      '/login/:siloName/local',
      handler(
        handlers['loginLocal'],
        schema.LoginLocalParams,
        schema.UsernamePasswordCredentials
      )
    ),
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
    rest.get(
      '/organizations/:orgName/projects/:projectName/instances/:instanceName/serial-console/stream',
      handler(
        handlers['instanceSerialConsoleStream'],
        schema.InstanceSerialConsoleStreamParams,
        null
      )
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
        schema.RouterRouteCreate
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
        schema.RouterRouteUpdate
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
      '/session/me/groups',
      handler(handlers['sessionMeGroups'], schema.SessionMeGroupsParams, null)
    ),
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
      '/system/certificates',
      handler(handlers['certificateList'], schema.CertificateListParams, null)
    ),
    rest.post(
      '/system/certificates',
      handler(handlers['certificateCreate'], null, schema.CertificateCreate)
    ),
    rest.get(
      '/system/certificates/:certificate',
      handler(handlers['certificateView'], schema.CertificateViewParams, null)
    ),
    rest.delete(
      '/system/certificates/:certificate',
      handler(handlers['certificateDelete'], schema.CertificateDeleteParams, null)
    ),
    rest.get(
      '/system/hardware/disks',
      handler(handlers['physicalDiskList'], schema.PhysicalDiskListParams, null)
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
      '/system/hardware/sleds/:sledId/disks',
      handler(handlers['sledPhysicalDiskList'], schema.SledPhysicalDiskListParams, null)
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
      '/system/ip-pools-service',
      handler(handlers['ipPoolServiceView'], null, null)
    ),
    rest.get(
      '/system/ip-pools-service/ranges',
      handler(handlers['ipPoolServiceRangeList'], schema.IpPoolServiceRangeListParams, null)
    ),
    rest.post(
      '/system/ip-pools-service/ranges/add',
      handler(handlers['ipPoolServiceRangeAdd'], null, schema.IpRange)
    ),
    rest.post(
      '/system/ip-pools-service/ranges/remove',
      handler(handlers['ipPoolServiceRangeRemove'], null, schema.IpRange)
    ),
    rest.get(
      '/system/metrics/:metricName',
      handler(handlers['systemMetric'], schema.SystemMetricParams, null)
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
      '/system/silos/:siloName/identity-providers/local/users',
      handler(
        handlers['localIdpUserCreate'],
        schema.LocalIdpUserCreateParams,
        schema.UserCreate
      )
    ),
    rest.delete(
      '/system/silos/:siloName/identity-providers/local/users/:userId',
      handler(handlers['localIdpUserDelete'], schema.LocalIdpUserDeleteParams, null)
    ),
    rest.post(
      '/system/silos/:siloName/identity-providers/local/users/:userId/set-password',
      handler(
        handlers['localIdpUserSetPassword'],
        schema.LocalIdpUserSetPasswordParams,
        schema.UserPassword
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
    rest.get(
      '/system/silos/:siloName/users/all',
      handler(handlers['siloUsersList'], schema.SiloUsersListParams, null)
    ),
    rest.get(
      '/system/silos/:siloName/users/id/:userId',
      handler(handlers['siloUserView'], schema.SiloUserViewParams, null)
    ),
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
    rest.get('/v1/disks', handler(handlers['diskListV1'], schema.DiskListV1Params, null)),
    rest.post(
      '/v1/disks',
      handler(handlers['diskCreateV1'], schema.DiskCreateV1Params, schema.DiskCreate)
    ),
    rest.get(
      '/v1/disks/:disk',
      handler(handlers['diskViewV1'], schema.DiskViewV1Params, null)
    ),
    rest.delete(
      '/v1/disks/:disk',
      handler(handlers['diskDeleteV1'], schema.DiskDeleteV1Params, null)
    ),
    rest.get(
      '/v1/instances',
      handler(handlers['instanceListV1'], schema.InstanceListV1Params, null)
    ),
    rest.post(
      '/v1/instances',
      handler(
        handlers['instanceCreateV1'],
        schema.InstanceCreateV1Params,
        schema.InstanceCreate
      )
    ),
    rest.get(
      '/v1/instances/:instance',
      handler(handlers['instanceViewV1'], schema.InstanceViewV1Params, null)
    ),
    rest.delete(
      '/v1/instances/:instance',
      handler(handlers['instanceDeleteV1'], schema.InstanceDeleteV1Params, null)
    ),
    rest.get(
      '/v1/instances/:instance/disks',
      handler(handlers['instanceDiskListV1'], schema.InstanceDiskListV1Params, null)
    ),
    rest.post(
      '/v1/instances/:instance/disks/attach',
      handler(
        handlers['instanceDiskAttachV1'],
        schema.InstanceDiskAttachV1Params,
        schema.DiskPath
      )
    ),
    rest.post(
      '/v1/instances/:instance/disks/detach',
      handler(
        handlers['instanceDiskDetachV1'],
        schema.InstanceDiskDetachV1Params,
        schema.DiskPath
      )
    ),
    rest.post(
      '/v1/instances/:instance/migrate',
      handler(
        handlers['instanceMigrateV1'],
        schema.InstanceMigrateV1Params,
        schema.InstanceMigrate
      )
    ),
    rest.post(
      '/v1/instances/:instance/reboot',
      handler(handlers['instanceRebootV1'], schema.InstanceRebootV1Params, null)
    ),
    rest.get(
      '/v1/instances/:instance/serial-console',
      handler(
        handlers['instanceSerialConsoleV1'],
        schema.InstanceSerialConsoleV1Params,
        null
      )
    ),
    rest.get(
      '/v1/instances/:instance/serial-console/stream',
      handler(
        handlers['instanceSerialConsoleStreamV1'],
        schema.InstanceSerialConsoleStreamV1Params,
        null
      )
    ),
    rest.post(
      '/v1/instances/:instance/start',
      handler(handlers['instanceStartV1'], schema.InstanceStartV1Params, null)
    ),
    rest.post(
      '/v1/instances/:instance/stop',
      handler(handlers['instanceStopV1'], schema.InstanceStopV1Params, null)
    ),
    rest.get(
      '/v1/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceListV1'],
        schema.InstanceNetworkInterfaceListV1Params,
        null
      )
    ),
    rest.post(
      '/v1/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceCreateV1'],
        schema.InstanceNetworkInterfaceCreateV1Params,
        schema.NetworkInterfaceCreate
      )
    ),
    rest.get(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceViewV1'],
        schema.InstanceNetworkInterfaceViewV1Params,
        null
      )
    ),
    rest.put(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceUpdateV1'],
        schema.InstanceNetworkInterfaceUpdateV1Params,
        schema.NetworkInterfaceUpdate
      )
    ),
    rest.delete(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceDeleteV1'],
        schema.InstanceNetworkInterfaceDeleteV1Params,
        null
      )
    ),
    rest.get(
      '/v1/organizations',
      handler(handlers['organizationListV1'], schema.OrganizationListV1Params, null)
    ),
    rest.post(
      '/v1/organizations',
      handler(handlers['organizationCreateV1'], null, schema.OrganizationCreate)
    ),
    rest.get(
      '/v1/organizations/:organization',
      handler(handlers['organizationViewV1'], schema.OrganizationViewV1Params, null)
    ),
    rest.put(
      '/v1/organizations/:organization',
      handler(
        handlers['organizationUpdateV1'],
        schema.OrganizationUpdateV1Params,
        schema.OrganizationUpdate
      )
    ),
    rest.delete(
      '/v1/organizations/:organization',
      handler(handlers['organizationDeleteV1'], schema.OrganizationDeleteV1Params, null)
    ),
    rest.get(
      '/v1/organizations/:organization/policy',
      handler(
        handlers['organizationPolicyViewV1'],
        schema.OrganizationPolicyViewV1Params,
        null
      )
    ),
    rest.put(
      '/v1/organizations/:organization/policy',
      handler(
        handlers['organizationPolicyUpdateV1'],
        schema.OrganizationPolicyUpdateV1Params,
        schema.OrganizationRolePolicy
      )
    ),
    rest.get('/v1/policy', handler(handlers['policyViewV1'], null, null)),
    rest.put(
      '/v1/policy',
      handler(handlers['policyUpdateV1'], null, schema.SiloRolePolicy)
    ),
    rest.get(
      '/v1/projects',
      handler(handlers['projectListV1'], schema.ProjectListV1Params, null)
    ),
    rest.post(
      '/v1/projects',
      handler(
        handlers['projectCreateV1'],
        schema.ProjectCreateV1Params,
        schema.ProjectCreate
      )
    ),
    rest.get(
      '/v1/projects/:project',
      handler(handlers['projectViewV1'], schema.ProjectViewV1Params, null)
    ),
    rest.put(
      '/v1/projects/:project',
      handler(
        handlers['projectUpdateV1'],
        schema.ProjectUpdateV1Params,
        schema.ProjectUpdate
      )
    ),
    rest.delete(
      '/v1/projects/:project',
      handler(handlers['projectDeleteV1'], schema.ProjectDeleteV1Params, null)
    ),
    rest.get(
      '/v1/projects/:project/policy',
      handler(handlers['projectPolicyViewV1'], schema.ProjectPolicyViewV1Params, null)
    ),
    rest.put(
      '/v1/projects/:project/policy',
      handler(
        handlers['projectPolicyUpdateV1'],
        schema.ProjectPolicyUpdateV1Params,
        schema.ProjectRolePolicy
      )
    ),
    rest.get(
      '/v1/snapshots',
      handler(handlers['snapshotListV1'], schema.SnapshotListV1Params, null)
    ),
    rest.post(
      '/v1/snapshots',
      handler(
        handlers['snapshotCreateV1'],
        schema.SnapshotCreateV1Params,
        schema.SnapshotCreate
      )
    ),
    rest.get(
      '/v1/snapshots/:snapshot',
      handler(handlers['snapshotViewV1'], schema.SnapshotViewV1Params, null)
    ),
    rest.delete(
      '/v1/snapshots/:snapshot',
      handler(handlers['snapshotDeleteV1'], schema.SnapshotDeleteV1Params, null)
    ),
    rest.get(
      '/v1/system/certificates',
      handler(handlers['certificateListV1'], schema.CertificateListV1Params, null)
    ),
    rest.post(
      '/v1/system/certificates',
      handler(handlers['certificateCreateV1'], null, schema.CertificateCreate)
    ),
    rest.get(
      '/v1/system/certificates/:certificate',
      handler(handlers['certificateViewV1'], schema.CertificateViewV1Params, null)
    ),
    rest.delete(
      '/v1/system/certificates/:certificate',
      handler(handlers['certificateDeleteV1'], schema.CertificateDeleteV1Params, null)
    ),
    rest.get(
      '/v1/system/hardware/disks',
      handler(handlers['physicalDiskListV1'], schema.PhysicalDiskListV1Params, null)
    ),
    rest.get(
      '/v1/system/hardware/racks',
      handler(handlers['rackListV1'], schema.RackListV1Params, null)
    ),
    rest.get(
      '/v1/system/hardware/racks/:rackId',
      handler(handlers['rackViewV1'], schema.RackViewV1Params, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds',
      handler(handlers['sledListV1'], schema.SledListV1Params, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds/:sledId',
      handler(handlers['sledViewV1'], schema.SledViewV1Params, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds/:sledId/disks',
      handler(handlers['sledPhysicalDiskListV1'], schema.SledPhysicalDiskListV1Params, null)
    ),
    rest.get('/v1/system/policy', handler(handlers['systemPolicyViewV1'], null, null)),
    rest.put(
      '/v1/system/policy',
      handler(handlers['systemPolicyUpdateV1'], null, schema.FleetRolePolicy)
    ),
    rest.get(
      '/v1/system/sagas',
      handler(handlers['sagaListV1'], schema.SagaListV1Params, null)
    ),
    rest.get(
      '/v1/system/sagas/:sagaId',
      handler(handlers['sagaViewV1'], schema.SagaViewV1Params, null)
    ),
    rest.get(
      '/v1/system/update/components',
      handler(
        handlers['systemComponentVersionList'],
        schema.SystemComponentVersionListParams,
        null
      )
    ),
    rest.get(
      '/v1/system/update/deployments',
      handler(handlers['updateDeploymentsList'], schema.UpdateDeploymentsListParams, null)
    ),
    rest.get(
      '/v1/system/update/deployments/:id',
      handler(handlers['updateDeploymentView'], schema.UpdateDeploymentViewParams, null)
    ),
    rest.post(
      '/v1/system/update/refresh',
      handler(handlers['systemUpdateRefresh'], null, null)
    ),
    rest.post(
      '/v1/system/update/start',
      handler(handlers['systemUpdateStart'], null, schema.SystemUpdateStart)
    ),
    rest.post('/v1/system/update/stop', handler(handlers['systemUpdateStop'], null, null)),
    rest.get(
      '/v1/system/update/updates',
      handler(handlers['systemUpdateList'], schema.SystemUpdateListParams, null)
    ),
    rest.get(
      '/v1/system/update/updates/:version',
      handler(handlers['systemUpdateView'], schema.SystemUpdateViewParams, null)
    ),
    rest.get(
      '/v1/system/update/updates/:version/components',
      handler(
        handlers['systemUpdateComponentsList'],
        schema.SystemUpdateComponentsListParams,
        null
      )
    ),
    rest.get('/v1/system/update/version', handler(handlers['systemVersion'], null, null)),
    rest.get(
      '/v1/vpc-router-routes',
      handler(handlers['vpcRouterRouteListV1'], schema.VpcRouterRouteListV1Params, null)
    ),
    rest.post(
      '/v1/vpc-router-routes',
      handler(
        handlers['vpcRouterRouteCreateV1'],
        schema.VpcRouterRouteCreateV1Params,
        schema.RouterRouteCreate
      )
    ),
    rest.get(
      '/v1/vpc-router-routes/:route',
      handler(handlers['vpcRouterRouteViewV1'], schema.VpcRouterRouteViewV1Params, null)
    ),
    rest.put(
      '/v1/vpc-router-routes/:route',
      handler(
        handlers['vpcRouterRouteUpdateV1'],
        schema.VpcRouterRouteUpdateV1Params,
        schema.RouterRouteUpdate
      )
    ),
    rest.delete(
      '/v1/vpc-router-routes/:route',
      handler(handlers['vpcRouterRouteDeleteV1'], schema.VpcRouterRouteDeleteV1Params, null)
    ),
    rest.get(
      '/v1/vpc-routers',
      handler(handlers['vpcRouterListV1'], schema.VpcRouterListV1Params, null)
    ),
    rest.post(
      '/v1/vpc-routers',
      handler(
        handlers['vpcRouterCreateV1'],
        schema.VpcRouterCreateV1Params,
        schema.VpcRouterCreate
      )
    ),
    rest.get(
      '/v1/vpc-routers/:router',
      handler(handlers['vpcRouterViewV1'], schema.VpcRouterViewV1Params, null)
    ),
    rest.put(
      '/v1/vpc-routers/:router',
      handler(
        handlers['vpcRouterUpdateV1'],
        schema.VpcRouterUpdateV1Params,
        schema.VpcRouterUpdate
      )
    ),
    rest.delete(
      '/v1/vpc-routers/:router',
      handler(handlers['vpcRouterDeleteV1'], schema.VpcRouterDeleteV1Params, null)
    ),
    rest.get(
      '/v1/vpc-subnets',
      handler(handlers['vpcSubnetListV1'], schema.VpcSubnetListV1Params, null)
    ),
    rest.post(
      '/v1/vpc-subnets',
      handler(
        handlers['vpcSubnetCreateV1'],
        schema.VpcSubnetCreateV1Params,
        schema.VpcSubnetCreate
      )
    ),
    rest.get(
      '/v1/vpc-subnets/:subnet',
      handler(handlers['vpcSubnetViewV1'], schema.VpcSubnetViewV1Params, null)
    ),
    rest.put(
      '/v1/vpc-subnets/:subnet',
      handler(
        handlers['vpcSubnetUpdateV1'],
        schema.VpcSubnetUpdateV1Params,
        schema.VpcSubnetUpdate
      )
    ),
    rest.delete(
      '/v1/vpc-subnets/:subnet',
      handler(handlers['vpcSubnetDeleteV1'], schema.VpcSubnetDeleteV1Params, null)
    ),
    rest.get('/v1/vpcs', handler(handlers['vpcListV1'], schema.VpcListV1Params, null)),
    rest.post(
      '/v1/vpcs',
      handler(handlers['vpcCreateV1'], schema.VpcCreateV1Params, schema.VpcCreate)
    ),
    rest.get('/v1/vpcs/:vpc', handler(handlers['vpcViewV1'], schema.VpcViewV1Params, null)),
    rest.put(
      '/v1/vpcs/:vpc',
      handler(handlers['vpcUpdateV1'], schema.VpcUpdateV1Params, schema.VpcUpdate)
    ),
    rest.delete(
      '/v1/vpcs/:vpc',
      handler(handlers['vpcDeleteV1'], schema.VpcDeleteV1Params, null)
    ),
  ]
}
