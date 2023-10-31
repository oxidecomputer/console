/* eslint-disable */

/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import {
  compose,
  context,
  ResponseComposition,
  ResponseTransformer,
  rest,
  RestContext,
  RestHandler,
  RestRequest,
} from 'msw'
import type { SnakeCasedPropertiesDeep as Snakify } from 'type-fest'
import { z, ZodSchema } from 'zod'

import type * as Api from './Api'
import { snakeify } from './util'
import * as schema from './validate'

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
  /** `POST /device/auth` */
  deviceAuthRequest: (params: { req: RestRequest }) => StatusCode
  /** `POST /device/confirm` */
  deviceAuthConfirm: (params: {
    body: Json<Api.DeviceAuthVerify>
    req: RestRequest
  }) => StatusCode
  /** `POST /device/token` */
  deviceAccessToken: (params: { req: RestRequest }) => StatusCode
  /** `POST /login/:siloName/saml/:providerName` */
  loginSaml: (params: { path: Api.LoginSamlPathParams; req: RestRequest }) => StatusCode
  /** `GET /v1/certificates` */
  certificateList: (params: {
    query: Api.CertificateListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.CertificateResultsPage>
  /** `POST /v1/certificates` */
  certificateCreate: (params: {
    body: Json<Api.CertificateCreate>
    req: RestRequest
  }) => HandlerResult<Api.Certificate>
  /** `GET /v1/certificates/:certificate` */
  certificateView: (params: {
    path: Api.CertificateViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Certificate>
  /** `DELETE /v1/certificates/:certificate` */
  certificateDelete: (params: {
    path: Api.CertificateDeletePathParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/disks` */
  diskList: (params: {
    query: Api.DiskListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /v1/disks` */
  diskCreate: (params: {
    query: Api.DiskCreateQueryParams
    body: Json<Api.DiskCreate>
    req: RestRequest
  }) => HandlerResult<Api.Disk>
  /** `GET /v1/disks/:disk` */
  diskView: (params: {
    path: Api.DiskViewPathParams
    query: Api.DiskViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Disk>
  /** `DELETE /v1/disks/:disk` */
  diskDelete: (params: {
    path: Api.DiskDeletePathParams
    query: Api.DiskDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/disks/:disk/bulk-write` */
  diskBulkWriteImport: (params: {
    path: Api.DiskBulkWriteImportPathParams
    query: Api.DiskBulkWriteImportQueryParams
    body: Json<Api.ImportBlocksBulkWrite>
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/disks/:disk/bulk-write-start` */
  diskBulkWriteImportStart: (params: {
    path: Api.DiskBulkWriteImportStartPathParams
    query: Api.DiskBulkWriteImportStartQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/disks/:disk/bulk-write-stop` */
  diskBulkWriteImportStop: (params: {
    path: Api.DiskBulkWriteImportStopPathParams
    query: Api.DiskBulkWriteImportStopQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/disks/:disk/finalize` */
  diskFinalizeImport: (params: {
    path: Api.DiskFinalizeImportPathParams
    query: Api.DiskFinalizeImportQueryParams
    body: Json<Api.FinalizeDisk>
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/disks/:disk/import` */
  diskImportBlocksFromUrl: (params: {
    path: Api.DiskImportBlocksFromUrlPathParams
    query: Api.DiskImportBlocksFromUrlQueryParams
    body: Json<Api.ImportBlocksFromUrl>
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/disks/:disk/metrics/:metric` */
  diskMetricsList: (params: {
    path: Api.DiskMetricsListPathParams
    query: Api.DiskMetricsListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.MeasurementResultsPage>
  /** `GET /v1/groups` */
  groupList: (params: {
    query: Api.GroupListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.GroupResultsPage>
  /** `GET /v1/groups/:groupId` */
  groupView: (params: {
    path: Api.GroupViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Group>
  /** `GET /v1/images` */
  imageList: (params: {
    query: Api.ImageListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.ImageResultsPage>
  /** `POST /v1/images` */
  imageCreate: (params: {
    query: Api.ImageCreateQueryParams
    body: Json<Api.ImageCreate>
    req: RestRequest
  }) => HandlerResult<Api.Image>
  /** `GET /v1/images/:image` */
  imageView: (params: {
    path: Api.ImageViewPathParams
    query: Api.ImageViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Image>
  /** `DELETE /v1/images/:image` */
  imageDelete: (params: {
    path: Api.ImageDeletePathParams
    query: Api.ImageDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/images/:image/demote` */
  imageDemote: (params: {
    path: Api.ImageDemotePathParams
    query: Api.ImageDemoteQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Image>
  /** `POST /v1/images/:image/promote` */
  imagePromote: (params: {
    path: Api.ImagePromotePathParams
    query: Api.ImagePromoteQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Image>
  /** `GET /v1/instances` */
  instanceList: (params: {
    query: Api.InstanceListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.InstanceResultsPage>
  /** `POST /v1/instances` */
  instanceCreate: (params: {
    query: Api.InstanceCreateQueryParams
    body: Json<Api.InstanceCreate>
    req: RestRequest
  }) => HandlerResult<Api.Instance>
  /** `GET /v1/instances/:instance` */
  instanceView: (params: {
    path: Api.InstanceViewPathParams
    query: Api.InstanceViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Instance>
  /** `DELETE /v1/instances/:instance` */
  instanceDelete: (params: {
    path: Api.InstanceDeletePathParams
    query: Api.InstanceDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/instances/:instance/disks` */
  instanceDiskList: (params: {
    path: Api.InstanceDiskListPathParams
    query: Api.InstanceDiskListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.DiskResultsPage>
  /** `POST /v1/instances/:instance/disks/attach` */
  instanceDiskAttach: (params: {
    path: Api.InstanceDiskAttachPathParams
    query: Api.InstanceDiskAttachQueryParams
    body: Json<Api.DiskPath>
    req: RestRequest
  }) => HandlerResult<Api.Disk>
  /** `POST /v1/instances/:instance/disks/detach` */
  instanceDiskDetach: (params: {
    path: Api.InstanceDiskDetachPathParams
    query: Api.InstanceDiskDetachQueryParams
    body: Json<Api.DiskPath>
    req: RestRequest
  }) => HandlerResult<Api.Disk>
  /** `GET /v1/instances/:instance/external-ips` */
  instanceExternalIpList: (params: {
    path: Api.InstanceExternalIpListPathParams
    query: Api.InstanceExternalIpListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.ExternalIpResultsPage>
  /** `POST /v1/instances/:instance/migrate` */
  instanceMigrate: (params: {
    path: Api.InstanceMigratePathParams
    query: Api.InstanceMigrateQueryParams
    body: Json<Api.InstanceMigrate>
    req: RestRequest
  }) => HandlerResult<Api.Instance>
  /** `POST /v1/instances/:instance/reboot` */
  instanceReboot: (params: {
    path: Api.InstanceRebootPathParams
    query: Api.InstanceRebootQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Instance>
  /** `GET /v1/instances/:instance/serial-console` */
  instanceSerialConsole: (params: {
    path: Api.InstanceSerialConsolePathParams
    query: Api.InstanceSerialConsoleQueryParams
    req: RestRequest
  }) => HandlerResult<Api.InstanceSerialConsoleData>
  /** `GET /v1/instances/:instance/serial-console/stream` */
  instanceSerialConsoleStream: (params: {
    path: Api.InstanceSerialConsoleStreamPathParams
    query: Api.InstanceSerialConsoleStreamQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/instances/:instance/start` */
  instanceStart: (params: {
    path: Api.InstanceStartPathParams
    query: Api.InstanceStartQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Instance>
  /** `POST /v1/instances/:instance/stop` */
  instanceStop: (params: {
    path: Api.InstanceStopPathParams
    query: Api.InstanceStopQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Instance>
  /** `GET /v1/ip-pools` */
  projectIpPoolList: (params: {
    query: Api.ProjectIpPoolListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.IpPoolResultsPage>
  /** `GET /v1/ip-pools/:pool` */
  projectIpPoolView: (params: {
    path: Api.ProjectIpPoolViewPathParams
    query: Api.ProjectIpPoolViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.IpPool>
  /** `POST /v1/login/:siloName/local` */
  loginLocal: (params: {
    path: Api.LoginLocalPathParams
    body: Json<Api.UsernamePasswordCredentials>
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/logout` */
  logout: (params: { req: RestRequest }) => StatusCode
  /** `GET /v1/me` */
  currentUserView: (params: { req: RestRequest }) => HandlerResult<Api.CurrentUser>
  /** `GET /v1/me/groups` */
  currentUserGroups: (params: {
    query: Api.CurrentUserGroupsQueryParams
    req: RestRequest
  }) => HandlerResult<Api.GroupResultsPage>
  /** `GET /v1/me/ssh-keys` */
  currentUserSshKeyList: (params: {
    query: Api.CurrentUserSshKeyListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SshKeyResultsPage>
  /** `POST /v1/me/ssh-keys` */
  currentUserSshKeyCreate: (params: {
    body: Json<Api.SshKeyCreate>
    req: RestRequest
  }) => HandlerResult<Api.SshKey>
  /** `GET /v1/me/ssh-keys/:sshKey` */
  currentUserSshKeyView: (params: {
    path: Api.CurrentUserSshKeyViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.SshKey>
  /** `DELETE /v1/me/ssh-keys/:sshKey` */
  currentUserSshKeyDelete: (params: {
    path: Api.CurrentUserSshKeyDeletePathParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/metrics/:metricName` */
  siloMetric: (params: {
    path: Api.SiloMetricPathParams
    query: Api.SiloMetricQueryParams
    req: RestRequest
  }) => HandlerResult<Api.MeasurementResultsPage>
  /** `GET /v1/network-interfaces` */
  instanceNetworkInterfaceList: (params: {
    query: Api.InstanceNetworkInterfaceListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.InstanceNetworkInterfaceResultsPage>
  /** `POST /v1/network-interfaces` */
  instanceNetworkInterfaceCreate: (params: {
    query: Api.InstanceNetworkInterfaceCreateQueryParams
    body: Json<Api.InstanceNetworkInterfaceCreate>
    req: RestRequest
  }) => HandlerResult<Api.InstanceNetworkInterface>
  /** `GET /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceView: (params: {
    path: Api.InstanceNetworkInterfaceViewPathParams
    query: Api.InstanceNetworkInterfaceViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.InstanceNetworkInterface>
  /** `PUT /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceUpdate: (params: {
    path: Api.InstanceNetworkInterfaceUpdatePathParams
    query: Api.InstanceNetworkInterfaceUpdateQueryParams
    body: Json<Api.InstanceNetworkInterfaceUpdate>
    req: RestRequest
  }) => HandlerResult<Api.InstanceNetworkInterface>
  /** `DELETE /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceDelete: (params: {
    path: Api.InstanceNetworkInterfaceDeletePathParams
    query: Api.InstanceNetworkInterfaceDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/ping` */
  ping: (params: { req: RestRequest }) => HandlerResult<Api.Ping>
  /** `GET /v1/policy` */
  policyView: (params: { req: RestRequest }) => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /v1/policy` */
  policyUpdate: (params: {
    body: Json<Api.SiloRolePolicy>
    req: RestRequest
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `GET /v1/projects` */
  projectList: (params: {
    query: Api.ProjectListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.ProjectResultsPage>
  /** `POST /v1/projects` */
  projectCreate: (params: {
    body: Json<Api.ProjectCreate>
    req: RestRequest
  }) => HandlerResult<Api.Project>
  /** `GET /v1/projects/:project` */
  projectView: (params: {
    path: Api.ProjectViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Project>
  /** `PUT /v1/projects/:project` */
  projectUpdate: (params: {
    path: Api.ProjectUpdatePathParams
    body: Json<Api.ProjectUpdate>
    req: RestRequest
  }) => HandlerResult<Api.Project>
  /** `DELETE /v1/projects/:project` */
  projectDelete: (params: {
    path: Api.ProjectDeletePathParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/projects/:project/policy` */
  projectPolicyView: (params: {
    path: Api.ProjectPolicyViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `PUT /v1/projects/:project/policy` */
  projectPolicyUpdate: (params: {
    path: Api.ProjectPolicyUpdatePathParams
    body: Json<Api.ProjectRolePolicy>
    req: RestRequest
  }) => HandlerResult<Api.ProjectRolePolicy>
  /** `GET /v1/snapshots` */
  snapshotList: (params: {
    query: Api.SnapshotListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SnapshotResultsPage>
  /** `POST /v1/snapshots` */
  snapshotCreate: (params: {
    query: Api.SnapshotCreateQueryParams
    body: Json<Api.SnapshotCreate>
    req: RestRequest
  }) => HandlerResult<Api.Snapshot>
  /** `GET /v1/snapshots/:snapshot` */
  snapshotView: (params: {
    path: Api.SnapshotViewPathParams
    query: Api.SnapshotViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Snapshot>
  /** `DELETE /v1/snapshots/:snapshot` */
  snapshotDelete: (params: {
    path: Api.SnapshotDeletePathParams
    query: Api.SnapshotDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/hardware/disks` */
  physicalDiskList: (params: {
    query: Api.PhysicalDiskListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.PhysicalDiskResultsPage>
  /** `GET /v1/system/hardware/racks` */
  rackList: (params: {
    query: Api.RackListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.RackResultsPage>
  /** `GET /v1/system/hardware/racks/:rackId` */
  rackView: (params: {
    path: Api.RackViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Rack>
  /** `GET /v1/system/hardware/sleds` */
  sledList: (params: {
    query: Api.SledListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SledResultsPage>
  /** `GET /v1/system/hardware/sleds/:sledId` */
  sledView: (params: {
    path: Api.SledViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Sled>
  /** `GET /v1/system/hardware/sleds/:sledId/disks` */
  sledPhysicalDiskList: (params: {
    path: Api.SledPhysicalDiskListPathParams
    query: Api.SledPhysicalDiskListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.PhysicalDiskResultsPage>
  /** `GET /v1/system/hardware/sleds/:sledId/instances` */
  sledInstanceList: (params: {
    path: Api.SledInstanceListPathParams
    query: Api.SledInstanceListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SledInstanceResultsPage>
  /** `GET /v1/system/hardware/switch-port` */
  networkingSwitchPortList: (params: {
    query: Api.NetworkingSwitchPortListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SwitchPortResultsPage>
  /** `POST /v1/system/hardware/switch-port/:port/settings` */
  networkingSwitchPortApplySettings: (params: {
    path: Api.NetworkingSwitchPortApplySettingsPathParams
    query: Api.NetworkingSwitchPortApplySettingsQueryParams
    body: Json<Api.SwitchPortApplySettings>
    req: RestRequest
  }) => StatusCode
  /** `DELETE /v1/system/hardware/switch-port/:port/settings` */
  networkingSwitchPortClearSettings: (params: {
    path: Api.NetworkingSwitchPortClearSettingsPathParams
    query: Api.NetworkingSwitchPortClearSettingsQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/hardware/switches` */
  switchList: (params: {
    query: Api.SwitchListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SwitchResultsPage>
  /** `GET /v1/system/hardware/switches/:switchId` */
  switchView: (params: {
    path: Api.SwitchViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Switch>
  /** `GET /v1/system/identity-providers` */
  siloIdentityProviderList: (params: {
    query: Api.SiloIdentityProviderListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.IdentityProviderResultsPage>
  /** `POST /v1/system/identity-providers/local/users` */
  localIdpUserCreate: (params: {
    query: Api.LocalIdpUserCreateQueryParams
    body: Json<Api.UserCreate>
    req: RestRequest
  }) => HandlerResult<Api.User>
  /** `DELETE /v1/system/identity-providers/local/users/:userId` */
  localIdpUserDelete: (params: {
    path: Api.LocalIdpUserDeletePathParams
    query: Api.LocalIdpUserDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/system/identity-providers/local/users/:userId/set-password` */
  localIdpUserSetPassword: (params: {
    path: Api.LocalIdpUserSetPasswordPathParams
    query: Api.LocalIdpUserSetPasswordQueryParams
    body: Json<Api.UserPassword>
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/system/identity-providers/saml` */
  samlIdentityProviderCreate: (params: {
    query: Api.SamlIdentityProviderCreateQueryParams
    body: Json<Api.SamlIdentityProviderCreate>
    req: RestRequest
  }) => HandlerResult<Api.SamlIdentityProvider>
  /** `GET /v1/system/identity-providers/saml/:provider` */
  samlIdentityProviderView: (params: {
    path: Api.SamlIdentityProviderViewPathParams
    query: Api.SamlIdentityProviderViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SamlIdentityProvider>
  /** `GET /v1/system/ip-pools` */
  ipPoolList: (params: {
    query: Api.IpPoolListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.IpPoolResultsPage>
  /** `POST /v1/system/ip-pools` */
  ipPoolCreate: (params: {
    body: Json<Api.IpPoolCreate>
    req: RestRequest
  }) => HandlerResult<Api.IpPool>
  /** `GET /v1/system/ip-pools/:pool` */
  ipPoolView: (params: {
    path: Api.IpPoolViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.IpPool>
  /** `PUT /v1/system/ip-pools/:pool` */
  ipPoolUpdate: (params: {
    path: Api.IpPoolUpdatePathParams
    body: Json<Api.IpPoolUpdate>
    req: RestRequest
  }) => HandlerResult<Api.IpPool>
  /** `DELETE /v1/system/ip-pools/:pool` */
  ipPoolDelete: (params: {
    path: Api.IpPoolDeletePathParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/ip-pools/:pool/ranges` */
  ipPoolRangeList: (params: {
    path: Api.IpPoolRangeListPathParams
    query: Api.IpPoolRangeListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.IpPoolRangeResultsPage>
  /** `POST /v1/system/ip-pools/:pool/ranges/add` */
  ipPoolRangeAdd: (params: {
    path: Api.IpPoolRangeAddPathParams
    body: Json<Api.IpRange>
    req: RestRequest
  }) => HandlerResult<Api.IpPoolRange>
  /** `POST /v1/system/ip-pools/:pool/ranges/remove` */
  ipPoolRangeRemove: (params: {
    path: Api.IpPoolRangeRemovePathParams
    body: Json<Api.IpRange>
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/ip-pools-service` */
  ipPoolServiceView: (params: { req: RestRequest }) => HandlerResult<Api.IpPool>
  /** `GET /v1/system/ip-pools-service/ranges` */
  ipPoolServiceRangeList: (params: {
    query: Api.IpPoolServiceRangeListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.IpPoolRangeResultsPage>
  /** `POST /v1/system/ip-pools-service/ranges/add` */
  ipPoolServiceRangeAdd: (params: {
    body: Json<Api.IpRange>
    req: RestRequest
  }) => HandlerResult<Api.IpPoolRange>
  /** `POST /v1/system/ip-pools-service/ranges/remove` */
  ipPoolServiceRangeRemove: (params: {
    body: Json<Api.IpRange>
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/metrics/:metricName` */
  systemMetric: (params: {
    path: Api.SystemMetricPathParams
    query: Api.SystemMetricQueryParams
    req: RestRequest
  }) => HandlerResult<Api.MeasurementResultsPage>
  /** `GET /v1/system/networking/address-lot` */
  networkingAddressLotList: (params: {
    query: Api.NetworkingAddressLotListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.AddressLotResultsPage>
  /** `POST /v1/system/networking/address-lot` */
  networkingAddressLotCreate: (params: {
    body: Json<Api.AddressLotCreate>
    req: RestRequest
  }) => HandlerResult<Api.AddressLotCreateResponse>
  /** `DELETE /v1/system/networking/address-lot/:addressLot` */
  networkingAddressLotDelete: (params: {
    path: Api.NetworkingAddressLotDeletePathParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/networking/address-lot/:addressLot/blocks` */
  networkingAddressLotBlockList: (params: {
    path: Api.NetworkingAddressLotBlockListPathParams
    query: Api.NetworkingAddressLotBlockListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.AddressLotBlockResultsPage>
  /** `GET /v1/system/networking/bgp` */
  networkingBgpConfigList: (params: {
    query: Api.NetworkingBgpConfigListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.BgpConfigResultsPage>
  /** `POST /v1/system/networking/bgp` */
  networkingBgpConfigCreate: (params: {
    body: Json<Api.BgpConfigCreate>
    req: RestRequest
  }) => HandlerResult<Api.BgpConfig>
  /** `DELETE /v1/system/networking/bgp` */
  networkingBgpConfigDelete: (params: {
    query: Api.NetworkingBgpConfigDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/networking/bgp-announce` */
  networkingBgpAnnounceSetList: (params: {
    query: Api.NetworkingBgpAnnounceSetListQueryParams
    req: RestRequest
  }) => StatusCode
  /** `POST /v1/system/networking/bgp-announce` */
  networkingBgpAnnounceSetCreate: (params: {
    body: Json<Api.BgpAnnounceSetCreate>
    req: RestRequest
  }) => HandlerResult<Api.BgpAnnounceSet>
  /** `DELETE /v1/system/networking/bgp-announce` */
  networkingBgpAnnounceSetDelete: (params: {
    query: Api.NetworkingBgpAnnounceSetDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/networking/bgp-routes-ipv4` */
  networkingBgpImportedRoutesIpv4: (params: {
    query: Api.NetworkingBgpImportedRoutesIpv4QueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/networking/bgp-status` */
  networkingBgpStatus: (params: { req: RestRequest }) => StatusCode
  /** `GET /v1/system/networking/loopback-address` */
  networkingLoopbackAddressList: (params: {
    query: Api.NetworkingLoopbackAddressListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.LoopbackAddressResultsPage>
  /** `POST /v1/system/networking/loopback-address` */
  networkingLoopbackAddressCreate: (params: {
    body: Json<Api.LoopbackAddressCreate>
    req: RestRequest
  }) => HandlerResult<Api.LoopbackAddress>
  /** `DELETE /v1/system/networking/loopback-address/:rackId/:switchLocation/:address/:subnetMask` */
  networkingLoopbackAddressDelete: (params: {
    path: Api.NetworkingLoopbackAddressDeletePathParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/networking/switch-port-settings` */
  networkingSwitchPortSettingsList: (params: {
    query: Api.NetworkingSwitchPortSettingsListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SwitchPortSettingsResultsPage>
  /** `POST /v1/system/networking/switch-port-settings` */
  networkingSwitchPortSettingsCreate: (params: {
    body: Json<Api.SwitchPortSettingsCreate>
    req: RestRequest
  }) => HandlerResult<Api.SwitchPortSettingsView>
  /** `DELETE /v1/system/networking/switch-port-settings` */
  networkingSwitchPortSettingsDelete: (params: {
    query: Api.NetworkingSwitchPortSettingsDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/system/networking/switch-port-settings/:port` */
  networkingSwitchPortSettingsView: (params: {
    path: Api.NetworkingSwitchPortSettingsViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.SwitchPortSettingsView>
  /** `GET /v1/system/policy` */
  systemPolicyView: (params: { req: RestRequest }) => HandlerResult<Api.FleetRolePolicy>
  /** `PUT /v1/system/policy` */
  systemPolicyUpdate: (params: {
    body: Json<Api.FleetRolePolicy>
    req: RestRequest
  }) => HandlerResult<Api.FleetRolePolicy>
  /** `GET /v1/system/roles` */
  roleList: (params: {
    query: Api.RoleListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.RoleResultsPage>
  /** `GET /v1/system/roles/:roleName` */
  roleView: (params: {
    path: Api.RoleViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Role>
  /** `GET /v1/system/silos` */
  siloList: (params: {
    query: Api.SiloListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.SiloResultsPage>
  /** `POST /v1/system/silos` */
  siloCreate: (params: {
    body: Json<Api.SiloCreate>
    req: RestRequest
  }) => HandlerResult<Api.Silo>
  /** `GET /v1/system/silos/:silo` */
  siloView: (params: {
    path: Api.SiloViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.Silo>
  /** `DELETE /v1/system/silos/:silo` */
  siloDelete: (params: { path: Api.SiloDeletePathParams; req: RestRequest }) => StatusCode
  /** `GET /v1/system/silos/:silo/policy` */
  siloPolicyView: (params: {
    path: Api.SiloPolicyViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `PUT /v1/system/silos/:silo/policy` */
  siloPolicyUpdate: (params: {
    path: Api.SiloPolicyUpdatePathParams
    body: Json<Api.SiloRolePolicy>
    req: RestRequest
  }) => HandlerResult<Api.SiloRolePolicy>
  /** `GET /v1/system/users` */
  siloUserList: (params: {
    query: Api.SiloUserListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.UserResultsPage>
  /** `GET /v1/system/users/:userId` */
  siloUserView: (params: {
    path: Api.SiloUserViewPathParams
    query: Api.SiloUserViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.User>
  /** `GET /v1/system/users-builtin` */
  userBuiltinList: (params: {
    query: Api.UserBuiltinListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.UserBuiltinResultsPage>
  /** `GET /v1/system/users-builtin/:user` */
  userBuiltinView: (params: {
    path: Api.UserBuiltinViewPathParams
    req: RestRequest
  }) => HandlerResult<Api.UserBuiltin>
  /** `GET /v1/users` */
  userList: (params: {
    query: Api.UserListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.UserResultsPage>
  /** `GET /v1/vpc-firewall-rules` */
  vpcFirewallRulesView: (params: {
    query: Api.VpcFirewallRulesViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.VpcFirewallRules>
  /** `PUT /v1/vpc-firewall-rules` */
  vpcFirewallRulesUpdate: (params: {
    query: Api.VpcFirewallRulesUpdateQueryParams
    body: Json<Api.VpcFirewallRuleUpdateParams>
    req: RestRequest
  }) => HandlerResult<Api.VpcFirewallRules>
  /** `GET /v1/vpc-router-routes` */
  vpcRouterRouteList: (params: {
    query: Api.VpcRouterRouteListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.RouterRouteResultsPage>
  /** `POST /v1/vpc-router-routes` */
  vpcRouterRouteCreate: (params: {
    query: Api.VpcRouterRouteCreateQueryParams
    body: Json<Api.RouterRouteCreate>
    req: RestRequest
  }) => HandlerResult<Api.RouterRoute>
  /** `GET /v1/vpc-router-routes/:route` */
  vpcRouterRouteView: (params: {
    path: Api.VpcRouterRouteViewPathParams
    query: Api.VpcRouterRouteViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.RouterRoute>
  /** `PUT /v1/vpc-router-routes/:route` */
  vpcRouterRouteUpdate: (params: {
    path: Api.VpcRouterRouteUpdatePathParams
    query: Api.VpcRouterRouteUpdateQueryParams
    body: Json<Api.RouterRouteUpdate>
    req: RestRequest
  }) => HandlerResult<Api.RouterRoute>
  /** `DELETE /v1/vpc-router-routes/:route` */
  vpcRouterRouteDelete: (params: {
    path: Api.VpcRouterRouteDeletePathParams
    query: Api.VpcRouterRouteDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/vpc-routers` */
  vpcRouterList: (params: {
    query: Api.VpcRouterListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.VpcRouterResultsPage>
  /** `POST /v1/vpc-routers` */
  vpcRouterCreate: (params: {
    query: Api.VpcRouterCreateQueryParams
    body: Json<Api.VpcRouterCreate>
    req: RestRequest
  }) => HandlerResult<Api.VpcRouter>
  /** `GET /v1/vpc-routers/:router` */
  vpcRouterView: (params: {
    path: Api.VpcRouterViewPathParams
    query: Api.VpcRouterViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.VpcRouter>
  /** `PUT /v1/vpc-routers/:router` */
  vpcRouterUpdate: (params: {
    path: Api.VpcRouterUpdatePathParams
    query: Api.VpcRouterUpdateQueryParams
    body: Json<Api.VpcRouterUpdate>
    req: RestRequest
  }) => HandlerResult<Api.VpcRouter>
  /** `DELETE /v1/vpc-routers/:router` */
  vpcRouterDelete: (params: {
    path: Api.VpcRouterDeletePathParams
    query: Api.VpcRouterDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/vpc-subnets` */
  vpcSubnetList: (params: {
    query: Api.VpcSubnetListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.VpcSubnetResultsPage>
  /** `POST /v1/vpc-subnets` */
  vpcSubnetCreate: (params: {
    query: Api.VpcSubnetCreateQueryParams
    body: Json<Api.VpcSubnetCreate>
    req: RestRequest
  }) => HandlerResult<Api.VpcSubnet>
  /** `GET /v1/vpc-subnets/:subnet` */
  vpcSubnetView: (params: {
    path: Api.VpcSubnetViewPathParams
    query: Api.VpcSubnetViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.VpcSubnet>
  /** `PUT /v1/vpc-subnets/:subnet` */
  vpcSubnetUpdate: (params: {
    path: Api.VpcSubnetUpdatePathParams
    query: Api.VpcSubnetUpdateQueryParams
    body: Json<Api.VpcSubnetUpdate>
    req: RestRequest
  }) => HandlerResult<Api.VpcSubnet>
  /** `DELETE /v1/vpc-subnets/:subnet` */
  vpcSubnetDelete: (params: {
    path: Api.VpcSubnetDeletePathParams
    query: Api.VpcSubnetDeleteQueryParams
    req: RestRequest
  }) => StatusCode
  /** `GET /v1/vpc-subnets/:subnet/network-interfaces` */
  vpcSubnetListNetworkInterfaces: (params: {
    path: Api.VpcSubnetListNetworkInterfacesPathParams
    query: Api.VpcSubnetListNetworkInterfacesQueryParams
    req: RestRequest
  }) => HandlerResult<Api.InstanceNetworkInterfaceResultsPage>
  /** `GET /v1/vpcs` */
  vpcList: (params: {
    query: Api.VpcListQueryParams
    req: RestRequest
  }) => HandlerResult<Api.VpcResultsPage>
  /** `POST /v1/vpcs` */
  vpcCreate: (params: {
    query: Api.VpcCreateQueryParams
    body: Json<Api.VpcCreate>
    req: RestRequest
  }) => HandlerResult<Api.Vpc>
  /** `GET /v1/vpcs/:vpc` */
  vpcView: (params: {
    path: Api.VpcViewPathParams
    query: Api.VpcViewQueryParams
    req: RestRequest
  }) => HandlerResult<Api.Vpc>
  /** `PUT /v1/vpcs/:vpc` */
  vpcUpdate: (params: {
    path: Api.VpcUpdatePathParams
    query: Api.VpcUpdateQueryParams
    body: Json<Api.VpcUpdate>
    req: RestRequest
  }) => HandlerResult<Api.Vpc>
  /** `DELETE /v1/vpcs/:vpc` */
  vpcDelete: (params: {
    path: Api.VpcDeletePathParams
    query: Api.VpcDeleteQueryParams
    req: RestRequest
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
      const result = await (handler as any).apply(null, [{ path, query, body, req }])
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
    rest.post('/device/auth', handler(handlers['deviceAuthRequest'], null, null)),
    rest.post(
      '/device/confirm',
      handler(handlers['deviceAuthConfirm'], null, schema.DeviceAuthVerify)
    ),
    rest.post('/device/token', handler(handlers['deviceAccessToken'], null, null)),
    rest.post(
      '/login/:siloName/saml/:providerName',
      handler(handlers['loginSaml'], schema.LoginSamlParams, null)
    ),
    rest.get(
      '/v1/certificates',
      handler(handlers['certificateList'], schema.CertificateListParams, null)
    ),
    rest.post(
      '/v1/certificates',
      handler(handlers['certificateCreate'], null, schema.CertificateCreate)
    ),
    rest.get(
      '/v1/certificates/:certificate',
      handler(handlers['certificateView'], schema.CertificateViewParams, null)
    ),
    rest.delete(
      '/v1/certificates/:certificate',
      handler(handlers['certificateDelete'], schema.CertificateDeleteParams, null)
    ),
    rest.get('/v1/disks', handler(handlers['diskList'], schema.DiskListParams, null)),
    rest.post(
      '/v1/disks',
      handler(handlers['diskCreate'], schema.DiskCreateParams, schema.DiskCreate)
    ),
    rest.get('/v1/disks/:disk', handler(handlers['diskView'], schema.DiskViewParams, null)),
    rest.delete(
      '/v1/disks/:disk',
      handler(handlers['diskDelete'], schema.DiskDeleteParams, null)
    ),
    rest.post(
      '/v1/disks/:disk/bulk-write',
      handler(
        handlers['diskBulkWriteImport'],
        schema.DiskBulkWriteImportParams,
        schema.ImportBlocksBulkWrite
      )
    ),
    rest.post(
      '/v1/disks/:disk/bulk-write-start',
      handler(
        handlers['diskBulkWriteImportStart'],
        schema.DiskBulkWriteImportStartParams,
        null
      )
    ),
    rest.post(
      '/v1/disks/:disk/bulk-write-stop',
      handler(
        handlers['diskBulkWriteImportStop'],
        schema.DiskBulkWriteImportStopParams,
        null
      )
    ),
    rest.post(
      '/v1/disks/:disk/finalize',
      handler(
        handlers['diskFinalizeImport'],
        schema.DiskFinalizeImportParams,
        schema.FinalizeDisk
      )
    ),
    rest.post(
      '/v1/disks/:disk/import',
      handler(
        handlers['diskImportBlocksFromUrl'],
        schema.DiskImportBlocksFromUrlParams,
        schema.ImportBlocksFromUrl
      )
    ),
    rest.get(
      '/v1/disks/:disk/metrics/:metric',
      handler(handlers['diskMetricsList'], schema.DiskMetricsListParams, null)
    ),
    rest.get('/v1/groups', handler(handlers['groupList'], schema.GroupListParams, null)),
    rest.get(
      '/v1/groups/:groupId',
      handler(handlers['groupView'], schema.GroupViewParams, null)
    ),
    rest.get('/v1/images', handler(handlers['imageList'], schema.ImageListParams, null)),
    rest.post(
      '/v1/images',
      handler(handlers['imageCreate'], schema.ImageCreateParams, schema.ImageCreate)
    ),
    rest.get(
      '/v1/images/:image',
      handler(handlers['imageView'], schema.ImageViewParams, null)
    ),
    rest.delete(
      '/v1/images/:image',
      handler(handlers['imageDelete'], schema.ImageDeleteParams, null)
    ),
    rest.post(
      '/v1/images/:image/demote',
      handler(handlers['imageDemote'], schema.ImageDemoteParams, null)
    ),
    rest.post(
      '/v1/images/:image/promote',
      handler(handlers['imagePromote'], schema.ImagePromoteParams, null)
    ),
    rest.get(
      '/v1/instances',
      handler(handlers['instanceList'], schema.InstanceListParams, null)
    ),
    rest.post(
      '/v1/instances',
      handler(
        handlers['instanceCreate'],
        schema.InstanceCreateParams,
        schema.InstanceCreate
      )
    ),
    rest.get(
      '/v1/instances/:instance',
      handler(handlers['instanceView'], schema.InstanceViewParams, null)
    ),
    rest.delete(
      '/v1/instances/:instance',
      handler(handlers['instanceDelete'], schema.InstanceDeleteParams, null)
    ),
    rest.get(
      '/v1/instances/:instance/disks',
      handler(handlers['instanceDiskList'], schema.InstanceDiskListParams, null)
    ),
    rest.post(
      '/v1/instances/:instance/disks/attach',
      handler(
        handlers['instanceDiskAttach'],
        schema.InstanceDiskAttachParams,
        schema.DiskPath
      )
    ),
    rest.post(
      '/v1/instances/:instance/disks/detach',
      handler(
        handlers['instanceDiskDetach'],
        schema.InstanceDiskDetachParams,
        schema.DiskPath
      )
    ),
    rest.get(
      '/v1/instances/:instance/external-ips',
      handler(handlers['instanceExternalIpList'], schema.InstanceExternalIpListParams, null)
    ),
    rest.post(
      '/v1/instances/:instance/migrate',
      handler(
        handlers['instanceMigrate'],
        schema.InstanceMigrateParams,
        schema.InstanceMigrate
      )
    ),
    rest.post(
      '/v1/instances/:instance/reboot',
      handler(handlers['instanceReboot'], schema.InstanceRebootParams, null)
    ),
    rest.get(
      '/v1/instances/:instance/serial-console',
      handler(handlers['instanceSerialConsole'], schema.InstanceSerialConsoleParams, null)
    ),
    rest.get(
      '/v1/instances/:instance/serial-console/stream',
      handler(
        handlers['instanceSerialConsoleStream'],
        schema.InstanceSerialConsoleStreamParams,
        null
      )
    ),
    rest.post(
      '/v1/instances/:instance/start',
      handler(handlers['instanceStart'], schema.InstanceStartParams, null)
    ),
    rest.post(
      '/v1/instances/:instance/stop',
      handler(handlers['instanceStop'], schema.InstanceStopParams, null)
    ),
    rest.get(
      '/v1/ip-pools',
      handler(handlers['projectIpPoolList'], schema.ProjectIpPoolListParams, null)
    ),
    rest.get(
      '/v1/ip-pools/:pool',
      handler(handlers['projectIpPoolView'], schema.ProjectIpPoolViewParams, null)
    ),
    rest.post(
      '/v1/login/:siloName/local',
      handler(
        handlers['loginLocal'],
        schema.LoginLocalParams,
        schema.UsernamePasswordCredentials
      )
    ),
    rest.post('/v1/logout', handler(handlers['logout'], null, null)),
    rest.get('/v1/me', handler(handlers['currentUserView'], null, null)),
    rest.get(
      '/v1/me/groups',
      handler(handlers['currentUserGroups'], schema.CurrentUserGroupsParams, null)
    ),
    rest.get(
      '/v1/me/ssh-keys',
      handler(handlers['currentUserSshKeyList'], schema.CurrentUserSshKeyListParams, null)
    ),
    rest.post(
      '/v1/me/ssh-keys',
      handler(handlers['currentUserSshKeyCreate'], null, schema.SshKeyCreate)
    ),
    rest.get(
      '/v1/me/ssh-keys/:sshKey',
      handler(handlers['currentUserSshKeyView'], schema.CurrentUserSshKeyViewParams, null)
    ),
    rest.delete(
      '/v1/me/ssh-keys/:sshKey',
      handler(
        handlers['currentUserSshKeyDelete'],
        schema.CurrentUserSshKeyDeleteParams,
        null
      )
    ),
    rest.get(
      '/v1/metrics/:metricName',
      handler(handlers['siloMetric'], schema.SiloMetricParams, null)
    ),
    rest.get(
      '/v1/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceList'],
        schema.InstanceNetworkInterfaceListParams,
        null
      )
    ),
    rest.post(
      '/v1/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceCreate'],
        schema.InstanceNetworkInterfaceCreateParams,
        schema.InstanceNetworkInterfaceCreate
      )
    ),
    rest.get(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceView'],
        schema.InstanceNetworkInterfaceViewParams,
        null
      )
    ),
    rest.put(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceUpdate'],
        schema.InstanceNetworkInterfaceUpdateParams,
        schema.InstanceNetworkInterfaceUpdate
      )
    ),
    rest.delete(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceDelete'],
        schema.InstanceNetworkInterfaceDeleteParams,
        null
      )
    ),
    rest.get('/v1/ping', handler(handlers['ping'], null, null)),
    rest.get('/v1/policy', handler(handlers['policyView'], null, null)),
    rest.put('/v1/policy', handler(handlers['policyUpdate'], null, schema.SiloRolePolicy)),
    rest.get(
      '/v1/projects',
      handler(handlers['projectList'], schema.ProjectListParams, null)
    ),
    rest.post(
      '/v1/projects',
      handler(handlers['projectCreate'], null, schema.ProjectCreate)
    ),
    rest.get(
      '/v1/projects/:project',
      handler(handlers['projectView'], schema.ProjectViewParams, null)
    ),
    rest.put(
      '/v1/projects/:project',
      handler(handlers['projectUpdate'], schema.ProjectUpdateParams, schema.ProjectUpdate)
    ),
    rest.delete(
      '/v1/projects/:project',
      handler(handlers['projectDelete'], schema.ProjectDeleteParams, null)
    ),
    rest.get(
      '/v1/projects/:project/policy',
      handler(handlers['projectPolicyView'], schema.ProjectPolicyViewParams, null)
    ),
    rest.put(
      '/v1/projects/:project/policy',
      handler(
        handlers['projectPolicyUpdate'],
        schema.ProjectPolicyUpdateParams,
        schema.ProjectRolePolicy
      )
    ),
    rest.get(
      '/v1/snapshots',
      handler(handlers['snapshotList'], schema.SnapshotListParams, null)
    ),
    rest.post(
      '/v1/snapshots',
      handler(
        handlers['snapshotCreate'],
        schema.SnapshotCreateParams,
        schema.SnapshotCreate
      )
    ),
    rest.get(
      '/v1/snapshots/:snapshot',
      handler(handlers['snapshotView'], schema.SnapshotViewParams, null)
    ),
    rest.delete(
      '/v1/snapshots/:snapshot',
      handler(handlers['snapshotDelete'], schema.SnapshotDeleteParams, null)
    ),
    rest.get(
      '/v1/system/hardware/disks',
      handler(handlers['physicalDiskList'], schema.PhysicalDiskListParams, null)
    ),
    rest.get(
      '/v1/system/hardware/racks',
      handler(handlers['rackList'], schema.RackListParams, null)
    ),
    rest.get(
      '/v1/system/hardware/racks/:rackId',
      handler(handlers['rackView'], schema.RackViewParams, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds',
      handler(handlers['sledList'], schema.SledListParams, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds/:sledId',
      handler(handlers['sledView'], schema.SledViewParams, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds/:sledId/disks',
      handler(handlers['sledPhysicalDiskList'], schema.SledPhysicalDiskListParams, null)
    ),
    rest.get(
      '/v1/system/hardware/sleds/:sledId/instances',
      handler(handlers['sledInstanceList'], schema.SledInstanceListParams, null)
    ),
    rest.get(
      '/v1/system/hardware/switch-port',
      handler(
        handlers['networkingSwitchPortList'],
        schema.NetworkingSwitchPortListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/hardware/switch-port/:port/settings',
      handler(
        handlers['networkingSwitchPortApplySettings'],
        schema.NetworkingSwitchPortApplySettingsParams,
        schema.SwitchPortApplySettings
      )
    ),
    rest.delete(
      '/v1/system/hardware/switch-port/:port/settings',
      handler(
        handlers['networkingSwitchPortClearSettings'],
        schema.NetworkingSwitchPortClearSettingsParams,
        null
      )
    ),
    rest.get(
      '/v1/system/hardware/switches',
      handler(handlers['switchList'], schema.SwitchListParams, null)
    ),
    rest.get(
      '/v1/system/hardware/switches/:switchId',
      handler(handlers['switchView'], schema.SwitchViewParams, null)
    ),
    rest.get(
      '/v1/system/identity-providers',
      handler(
        handlers['siloIdentityProviderList'],
        schema.SiloIdentityProviderListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/identity-providers/local/users',
      handler(
        handlers['localIdpUserCreate'],
        schema.LocalIdpUserCreateParams,
        schema.UserCreate
      )
    ),
    rest.delete(
      '/v1/system/identity-providers/local/users/:userId',
      handler(handlers['localIdpUserDelete'], schema.LocalIdpUserDeleteParams, null)
    ),
    rest.post(
      '/v1/system/identity-providers/local/users/:userId/set-password',
      handler(
        handlers['localIdpUserSetPassword'],
        schema.LocalIdpUserSetPasswordParams,
        schema.UserPassword
      )
    ),
    rest.post(
      '/v1/system/identity-providers/saml',
      handler(
        handlers['samlIdentityProviderCreate'],
        schema.SamlIdentityProviderCreateParams,
        schema.SamlIdentityProviderCreate
      )
    ),
    rest.get(
      '/v1/system/identity-providers/saml/:provider',
      handler(
        handlers['samlIdentityProviderView'],
        schema.SamlIdentityProviderViewParams,
        null
      )
    ),
    rest.get(
      '/v1/system/ip-pools',
      handler(handlers['ipPoolList'], schema.IpPoolListParams, null)
    ),
    rest.post(
      '/v1/system/ip-pools',
      handler(handlers['ipPoolCreate'], null, schema.IpPoolCreate)
    ),
    rest.get(
      '/v1/system/ip-pools/:pool',
      handler(handlers['ipPoolView'], schema.IpPoolViewParams, null)
    ),
    rest.put(
      '/v1/system/ip-pools/:pool',
      handler(handlers['ipPoolUpdate'], schema.IpPoolUpdateParams, schema.IpPoolUpdate)
    ),
    rest.delete(
      '/v1/system/ip-pools/:pool',
      handler(handlers['ipPoolDelete'], schema.IpPoolDeleteParams, null)
    ),
    rest.get(
      '/v1/system/ip-pools/:pool/ranges',
      handler(handlers['ipPoolRangeList'], schema.IpPoolRangeListParams, null)
    ),
    rest.post(
      '/v1/system/ip-pools/:pool/ranges/add',
      handler(handlers['ipPoolRangeAdd'], schema.IpPoolRangeAddParams, schema.IpRange)
    ),
    rest.post(
      '/v1/system/ip-pools/:pool/ranges/remove',
      handler(handlers['ipPoolRangeRemove'], schema.IpPoolRangeRemoveParams, schema.IpRange)
    ),
    rest.get(
      '/v1/system/ip-pools-service',
      handler(handlers['ipPoolServiceView'], null, null)
    ),
    rest.get(
      '/v1/system/ip-pools-service/ranges',
      handler(handlers['ipPoolServiceRangeList'], schema.IpPoolServiceRangeListParams, null)
    ),
    rest.post(
      '/v1/system/ip-pools-service/ranges/add',
      handler(handlers['ipPoolServiceRangeAdd'], null, schema.IpRange)
    ),
    rest.post(
      '/v1/system/ip-pools-service/ranges/remove',
      handler(handlers['ipPoolServiceRangeRemove'], null, schema.IpRange)
    ),
    rest.get(
      '/v1/system/metrics/:metricName',
      handler(handlers['systemMetric'], schema.SystemMetricParams, null)
    ),
    rest.get(
      '/v1/system/networking/address-lot',
      handler(
        handlers['networkingAddressLotList'],
        schema.NetworkingAddressLotListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/networking/address-lot',
      handler(handlers['networkingAddressLotCreate'], null, schema.AddressLotCreate)
    ),
    rest.delete(
      '/v1/system/networking/address-lot/:addressLot',
      handler(
        handlers['networkingAddressLotDelete'],
        schema.NetworkingAddressLotDeleteParams,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/address-lot/:addressLot/blocks',
      handler(
        handlers['networkingAddressLotBlockList'],
        schema.NetworkingAddressLotBlockListParams,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/bgp',
      handler(
        handlers['networkingBgpConfigList'],
        schema.NetworkingBgpConfigListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/networking/bgp',
      handler(handlers['networkingBgpConfigCreate'], null, schema.BgpConfigCreate)
    ),
    rest.delete(
      '/v1/system/networking/bgp',
      handler(
        handlers['networkingBgpConfigDelete'],
        schema.NetworkingBgpConfigDeleteParams,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/bgp-announce',
      handler(
        handlers['networkingBgpAnnounceSetList'],
        schema.NetworkingBgpAnnounceSetListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/networking/bgp-announce',
      handler(handlers['networkingBgpAnnounceSetCreate'], null, schema.BgpAnnounceSetCreate)
    ),
    rest.delete(
      '/v1/system/networking/bgp-announce',
      handler(
        handlers['networkingBgpAnnounceSetDelete'],
        schema.NetworkingBgpAnnounceSetDeleteParams,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/bgp-routes-ipv4',
      handler(
        handlers['networkingBgpImportedRoutesIpv4'],
        schema.NetworkingBgpImportedRoutesIpv4Params,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/bgp-status',
      handler(handlers['networkingBgpStatus'], null, null)
    ),
    rest.get(
      '/v1/system/networking/loopback-address',
      handler(
        handlers['networkingLoopbackAddressList'],
        schema.NetworkingLoopbackAddressListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/networking/loopback-address',
      handler(
        handlers['networkingLoopbackAddressCreate'],
        null,
        schema.LoopbackAddressCreate
      )
    ),
    rest.delete(
      '/v1/system/networking/loopback-address/:rackId/:switchLocation/:address/:subnetMask',
      handler(
        handlers['networkingLoopbackAddressDelete'],
        schema.NetworkingLoopbackAddressDeleteParams,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/switch-port-settings',
      handler(
        handlers['networkingSwitchPortSettingsList'],
        schema.NetworkingSwitchPortSettingsListParams,
        null
      )
    ),
    rest.post(
      '/v1/system/networking/switch-port-settings',
      handler(
        handlers['networkingSwitchPortSettingsCreate'],
        null,
        schema.SwitchPortSettingsCreate
      )
    ),
    rest.delete(
      '/v1/system/networking/switch-port-settings',
      handler(
        handlers['networkingSwitchPortSettingsDelete'],
        schema.NetworkingSwitchPortSettingsDeleteParams,
        null
      )
    ),
    rest.get(
      '/v1/system/networking/switch-port-settings/:port',
      handler(
        handlers['networkingSwitchPortSettingsView'],
        schema.NetworkingSwitchPortSettingsViewParams,
        null
      )
    ),
    rest.get('/v1/system/policy', handler(handlers['systemPolicyView'], null, null)),
    rest.put(
      '/v1/system/policy',
      handler(handlers['systemPolicyUpdate'], null, schema.FleetRolePolicy)
    ),
    rest.get(
      '/v1/system/roles',
      handler(handlers['roleList'], schema.RoleListParams, null)
    ),
    rest.get(
      '/v1/system/roles/:roleName',
      handler(handlers['roleView'], schema.RoleViewParams, null)
    ),
    rest.get(
      '/v1/system/silos',
      handler(handlers['siloList'], schema.SiloListParams, null)
    ),
    rest.post('/v1/system/silos', handler(handlers['siloCreate'], null, schema.SiloCreate)),
    rest.get(
      '/v1/system/silos/:silo',
      handler(handlers['siloView'], schema.SiloViewParams, null)
    ),
    rest.delete(
      '/v1/system/silos/:silo',
      handler(handlers['siloDelete'], schema.SiloDeleteParams, null)
    ),
    rest.get(
      '/v1/system/silos/:silo/policy',
      handler(handlers['siloPolicyView'], schema.SiloPolicyViewParams, null)
    ),
    rest.put(
      '/v1/system/silos/:silo/policy',
      handler(
        handlers['siloPolicyUpdate'],
        schema.SiloPolicyUpdateParams,
        schema.SiloRolePolicy
      )
    ),
    rest.get(
      '/v1/system/users',
      handler(handlers['siloUserList'], schema.SiloUserListParams, null)
    ),
    rest.get(
      '/v1/system/users/:userId',
      handler(handlers['siloUserView'], schema.SiloUserViewParams, null)
    ),
    rest.get(
      '/v1/system/users-builtin',
      handler(handlers['userBuiltinList'], schema.UserBuiltinListParams, null)
    ),
    rest.get(
      '/v1/system/users-builtin/:user',
      handler(handlers['userBuiltinView'], schema.UserBuiltinViewParams, null)
    ),
    rest.get('/v1/users', handler(handlers['userList'], schema.UserListParams, null)),
    rest.get(
      '/v1/vpc-firewall-rules',
      handler(handlers['vpcFirewallRulesView'], schema.VpcFirewallRulesViewParams, null)
    ),
    rest.put(
      '/v1/vpc-firewall-rules',
      handler(
        handlers['vpcFirewallRulesUpdate'],
        schema.VpcFirewallRulesUpdateParams,
        schema.VpcFirewallRuleUpdateParams
      )
    ),
    rest.get(
      '/v1/vpc-router-routes',
      handler(handlers['vpcRouterRouteList'], schema.VpcRouterRouteListParams, null)
    ),
    rest.post(
      '/v1/vpc-router-routes',
      handler(
        handlers['vpcRouterRouteCreate'],
        schema.VpcRouterRouteCreateParams,
        schema.RouterRouteCreate
      )
    ),
    rest.get(
      '/v1/vpc-router-routes/:route',
      handler(handlers['vpcRouterRouteView'], schema.VpcRouterRouteViewParams, null)
    ),
    rest.put(
      '/v1/vpc-router-routes/:route',
      handler(
        handlers['vpcRouterRouteUpdate'],
        schema.VpcRouterRouteUpdateParams,
        schema.RouterRouteUpdate
      )
    ),
    rest.delete(
      '/v1/vpc-router-routes/:route',
      handler(handlers['vpcRouterRouteDelete'], schema.VpcRouterRouteDeleteParams, null)
    ),
    rest.get(
      '/v1/vpc-routers',
      handler(handlers['vpcRouterList'], schema.VpcRouterListParams, null)
    ),
    rest.post(
      '/v1/vpc-routers',
      handler(
        handlers['vpcRouterCreate'],
        schema.VpcRouterCreateParams,
        schema.VpcRouterCreate
      )
    ),
    rest.get(
      '/v1/vpc-routers/:router',
      handler(handlers['vpcRouterView'], schema.VpcRouterViewParams, null)
    ),
    rest.put(
      '/v1/vpc-routers/:router',
      handler(
        handlers['vpcRouterUpdate'],
        schema.VpcRouterUpdateParams,
        schema.VpcRouterUpdate
      )
    ),
    rest.delete(
      '/v1/vpc-routers/:router',
      handler(handlers['vpcRouterDelete'], schema.VpcRouterDeleteParams, null)
    ),
    rest.get(
      '/v1/vpc-subnets',
      handler(handlers['vpcSubnetList'], schema.VpcSubnetListParams, null)
    ),
    rest.post(
      '/v1/vpc-subnets',
      handler(
        handlers['vpcSubnetCreate'],
        schema.VpcSubnetCreateParams,
        schema.VpcSubnetCreate
      )
    ),
    rest.get(
      '/v1/vpc-subnets/:subnet',
      handler(handlers['vpcSubnetView'], schema.VpcSubnetViewParams, null)
    ),
    rest.put(
      '/v1/vpc-subnets/:subnet',
      handler(
        handlers['vpcSubnetUpdate'],
        schema.VpcSubnetUpdateParams,
        schema.VpcSubnetUpdate
      )
    ),
    rest.delete(
      '/v1/vpc-subnets/:subnet',
      handler(handlers['vpcSubnetDelete'], schema.VpcSubnetDeleteParams, null)
    ),
    rest.get(
      '/v1/vpc-subnets/:subnet/network-interfaces',
      handler(
        handlers['vpcSubnetListNetworkInterfaces'],
        schema.VpcSubnetListNetworkInterfacesParams,
        null
      )
    ),
    rest.get('/v1/vpcs', handler(handlers['vpcList'], schema.VpcListParams, null)),
    rest.post(
      '/v1/vpcs',
      handler(handlers['vpcCreate'], schema.VpcCreateParams, schema.VpcCreate)
    ),
    rest.get('/v1/vpcs/:vpc', handler(handlers['vpcView'], schema.VpcViewParams, null)),
    rest.put(
      '/v1/vpcs/:vpc',
      handler(handlers['vpcUpdate'], schema.VpcUpdateParams, schema.VpcUpdate)
    ),
    rest.delete(
      '/v1/vpcs/:vpc',
      handler(handlers['vpcDelete'], schema.VpcDeleteParams, null)
    ),
  ]
}
