/**
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import {
  http,
  HttpResponse,
  type HttpHandler,
  type PathParams,
  type StrictResponse,
} from 'msw'
import type { Promisable, SnakeCasedPropertiesDeep as Snakify } from 'type-fest'
import { type ZodSchema } from 'zod'

import type * as Api from './Api'
import { snakeify } from './util'
import * as schema from './validate'

type HandlerResult<T> = Json<T> | StrictResponse<Json<T>>
type StatusCode = number

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
export const json = HttpResponse.json

// Shortcut to reduce number of imports required in consumers
export { HttpResponse }

export interface MSWHandlers {
  /** `POST /device/auth` */
  deviceAuthRequest: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /device/confirm` */
  deviceAuthConfirm: (params: {
    body: Json<Api.DeviceAuthVerify>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /device/token` */
  deviceAccessToken: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /experimental/v1/probes` */
  probeList: (params: {
    query: Api.ProbeListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ProbeInfoResultsPage>>
  /** `POST /experimental/v1/probes` */
  probeCreate: (params: {
    query: Api.ProbeCreateQueryParams
    body: Json<Api.ProbeCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Probe>>
  /** `GET /experimental/v1/probes/:probe` */
  probeView: (params: {
    path: Api.ProbeViewPathParams
    query: Api.ProbeViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ProbeInfo>>
  /** `DELETE /experimental/v1/probes/:probe` */
  probeDelete: (params: {
    path: Api.ProbeDeletePathParams
    query: Api.ProbeDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /login/:siloName/saml/:providerName` */
  loginSaml: (params: {
    path: Api.LoginSamlPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/certificates` */
  certificateList: (params: {
    query: Api.CertificateListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.CertificateResultsPage>>
  /** `POST /v1/certificates` */
  certificateCreate: (params: {
    body: Json<Api.CertificateCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Certificate>>
  /** `GET /v1/certificates/:certificate` */
  certificateView: (params: {
    path: Api.CertificateViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Certificate>>
  /** `DELETE /v1/certificates/:certificate` */
  certificateDelete: (params: {
    path: Api.CertificateDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/disks` */
  diskList: (params: {
    query: Api.DiskListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.DiskResultsPage>>
  /** `POST /v1/disks` */
  diskCreate: (params: {
    query: Api.DiskCreateQueryParams
    body: Json<Api.DiskCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Disk>>
  /** `GET /v1/disks/:disk` */
  diskView: (params: {
    path: Api.DiskViewPathParams
    query: Api.DiskViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Disk>>
  /** `DELETE /v1/disks/:disk` */
  diskDelete: (params: {
    path: Api.DiskDeletePathParams
    query: Api.DiskDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/disks/:disk/bulk-write` */
  diskBulkWriteImport: (params: {
    path: Api.DiskBulkWriteImportPathParams
    query: Api.DiskBulkWriteImportQueryParams
    body: Json<Api.ImportBlocksBulkWrite>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/disks/:disk/bulk-write-start` */
  diskBulkWriteImportStart: (params: {
    path: Api.DiskBulkWriteImportStartPathParams
    query: Api.DiskBulkWriteImportStartQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/disks/:disk/bulk-write-stop` */
  diskBulkWriteImportStop: (params: {
    path: Api.DiskBulkWriteImportStopPathParams
    query: Api.DiskBulkWriteImportStopQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/disks/:disk/finalize` */
  diskFinalizeImport: (params: {
    path: Api.DiskFinalizeImportPathParams
    query: Api.DiskFinalizeImportQueryParams
    body: Json<Api.FinalizeDisk>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/disks/:disk/metrics/:metric` */
  diskMetricsList: (params: {
    path: Api.DiskMetricsListPathParams
    query: Api.DiskMetricsListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.MeasurementResultsPage>>
  /** `GET /v1/floating-ips` */
  floatingIpList: (params: {
    query: Api.FloatingIpListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FloatingIpResultsPage>>
  /** `POST /v1/floating-ips` */
  floatingIpCreate: (params: {
    query: Api.FloatingIpCreateQueryParams
    body: Json<Api.FloatingIpCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FloatingIp>>
  /** `GET /v1/floating-ips/:floatingIp` */
  floatingIpView: (params: {
    path: Api.FloatingIpViewPathParams
    query: Api.FloatingIpViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FloatingIp>>
  /** `PUT /v1/floating-ips/:floatingIp` */
  floatingIpUpdate: (params: {
    path: Api.FloatingIpUpdatePathParams
    query: Api.FloatingIpUpdateQueryParams
    body: Json<Api.FloatingIpUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FloatingIp>>
  /** `DELETE /v1/floating-ips/:floatingIp` */
  floatingIpDelete: (params: {
    path: Api.FloatingIpDeletePathParams
    query: Api.FloatingIpDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/floating-ips/:floatingIp/attach` */
  floatingIpAttach: (params: {
    path: Api.FloatingIpAttachPathParams
    query: Api.FloatingIpAttachQueryParams
    body: Json<Api.FloatingIpAttach>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FloatingIp>>
  /** `POST /v1/floating-ips/:floatingIp/detach` */
  floatingIpDetach: (params: {
    path: Api.FloatingIpDetachPathParams
    query: Api.FloatingIpDetachQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FloatingIp>>
  /** `GET /v1/groups` */
  groupList: (params: {
    query: Api.GroupListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.GroupResultsPage>>
  /** `GET /v1/groups/:groupId` */
  groupView: (params: {
    path: Api.GroupViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Group>>
  /** `GET /v1/images` */
  imageList: (params: {
    query: Api.ImageListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ImageResultsPage>>
  /** `POST /v1/images` */
  imageCreate: (params: {
    query: Api.ImageCreateQueryParams
    body: Json<Api.ImageCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Image>>
  /** `GET /v1/images/:image` */
  imageView: (params: {
    path: Api.ImageViewPathParams
    query: Api.ImageViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Image>>
  /** `DELETE /v1/images/:image` */
  imageDelete: (params: {
    path: Api.ImageDeletePathParams
    query: Api.ImageDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/images/:image/demote` */
  imageDemote: (params: {
    path: Api.ImageDemotePathParams
    query: Api.ImageDemoteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Image>>
  /** `POST /v1/images/:image/promote` */
  imagePromote: (params: {
    path: Api.ImagePromotePathParams
    query: Api.ImagePromoteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Image>>
  /** `GET /v1/instances` */
  instanceList: (params: {
    query: Api.InstanceListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceResultsPage>>
  /** `POST /v1/instances` */
  instanceCreate: (params: {
    query: Api.InstanceCreateQueryParams
    body: Json<Api.InstanceCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Instance>>
  /** `GET /v1/instances/:instance` */
  instanceView: (params: {
    path: Api.InstanceViewPathParams
    query: Api.InstanceViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Instance>>
  /** `DELETE /v1/instances/:instance` */
  instanceDelete: (params: {
    path: Api.InstanceDeletePathParams
    query: Api.InstanceDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/instances/:instance/disks` */
  instanceDiskList: (params: {
    path: Api.InstanceDiskListPathParams
    query: Api.InstanceDiskListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.DiskResultsPage>>
  /** `POST /v1/instances/:instance/disks/attach` */
  instanceDiskAttach: (params: {
    path: Api.InstanceDiskAttachPathParams
    query: Api.InstanceDiskAttachQueryParams
    body: Json<Api.DiskPath>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Disk>>
  /** `POST /v1/instances/:instance/disks/detach` */
  instanceDiskDetach: (params: {
    path: Api.InstanceDiskDetachPathParams
    query: Api.InstanceDiskDetachQueryParams
    body: Json<Api.DiskPath>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Disk>>
  /** `GET /v1/instances/:instance/external-ips` */
  instanceExternalIpList: (params: {
    path: Api.InstanceExternalIpListPathParams
    query: Api.InstanceExternalIpListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ExternalIpResultsPage>>
  /** `POST /v1/instances/:instance/external-ips/ephemeral` */
  instanceEphemeralIpAttach: (params: {
    path: Api.InstanceEphemeralIpAttachPathParams
    query: Api.InstanceEphemeralIpAttachQueryParams
    body: Json<Api.EphemeralIpCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ExternalIp>>
  /** `DELETE /v1/instances/:instance/external-ips/ephemeral` */
  instanceEphemeralIpDetach: (params: {
    path: Api.InstanceEphemeralIpDetachPathParams
    query: Api.InstanceEphemeralIpDetachQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/instances/:instance/migrate` */
  instanceMigrate: (params: {
    path: Api.InstanceMigratePathParams
    query: Api.InstanceMigrateQueryParams
    body: Json<Api.InstanceMigrate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Instance>>
  /** `POST /v1/instances/:instance/reboot` */
  instanceReboot: (params: {
    path: Api.InstanceRebootPathParams
    query: Api.InstanceRebootQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Instance>>
  /** `GET /v1/instances/:instance/serial-console` */
  instanceSerialConsole: (params: {
    path: Api.InstanceSerialConsolePathParams
    query: Api.InstanceSerialConsoleQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceSerialConsoleData>>
  /** `GET /v1/instances/:instance/serial-console/stream` */
  instanceSerialConsoleStream: (params: {
    path: Api.InstanceSerialConsoleStreamPathParams
    query: Api.InstanceSerialConsoleStreamQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/instances/:instance/ssh-public-keys` */
  instanceSshPublicKeyList: (params: {
    path: Api.InstanceSshPublicKeyListPathParams
    query: Api.InstanceSshPublicKeyListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SshKeyResultsPage>>
  /** `POST /v1/instances/:instance/start` */
  instanceStart: (params: {
    path: Api.InstanceStartPathParams
    query: Api.InstanceStartQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Instance>>
  /** `POST /v1/instances/:instance/stop` */
  instanceStop: (params: {
    path: Api.InstanceStopPathParams
    query: Api.InstanceStopQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Instance>>
  /** `GET /v1/ip-pools` */
  projectIpPoolList: (params: {
    query: Api.ProjectIpPoolListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloIpPoolResultsPage>>
  /** `GET /v1/ip-pools/:pool` */
  projectIpPoolView: (params: {
    path: Api.ProjectIpPoolViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloIpPool>>
  /** `POST /v1/login/:siloName/local` */
  loginLocal: (params: {
    path: Api.LoginLocalPathParams
    body: Json<Api.UsernamePasswordCredentials>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/logout` */
  logout: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/me` */
  currentUserView: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.CurrentUser>>
  /** `GET /v1/me/groups` */
  currentUserGroups: (params: {
    query: Api.CurrentUserGroupsQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.GroupResultsPage>>
  /** `GET /v1/me/ssh-keys` */
  currentUserSshKeyList: (params: {
    query: Api.CurrentUserSshKeyListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SshKeyResultsPage>>
  /** `POST /v1/me/ssh-keys` */
  currentUserSshKeyCreate: (params: {
    body: Json<Api.SshKeyCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SshKey>>
  /** `GET /v1/me/ssh-keys/:sshKey` */
  currentUserSshKeyView: (params: {
    path: Api.CurrentUserSshKeyViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SshKey>>
  /** `DELETE /v1/me/ssh-keys/:sshKey` */
  currentUserSshKeyDelete: (params: {
    path: Api.CurrentUserSshKeyDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/metrics/:metricName` */
  siloMetric: (params: {
    path: Api.SiloMetricPathParams
    query: Api.SiloMetricQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.MeasurementResultsPage>>
  /** `GET /v1/network-interfaces` */
  instanceNetworkInterfaceList: (params: {
    query: Api.InstanceNetworkInterfaceListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceNetworkInterfaceResultsPage>>
  /** `POST /v1/network-interfaces` */
  instanceNetworkInterfaceCreate: (params: {
    query: Api.InstanceNetworkInterfaceCreateQueryParams
    body: Json<Api.InstanceNetworkInterfaceCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceNetworkInterface>>
  /** `GET /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceView: (params: {
    path: Api.InstanceNetworkInterfaceViewPathParams
    query: Api.InstanceNetworkInterfaceViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceNetworkInterface>>
  /** `PUT /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceUpdate: (params: {
    path: Api.InstanceNetworkInterfaceUpdatePathParams
    query: Api.InstanceNetworkInterfaceUpdateQueryParams
    body: Json<Api.InstanceNetworkInterfaceUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceNetworkInterface>>
  /** `DELETE /v1/network-interfaces/:interface` */
  instanceNetworkInterfaceDelete: (params: {
    path: Api.InstanceNetworkInterfaceDeletePathParams
    query: Api.InstanceNetworkInterfaceDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/ping` */
  ping: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Ping>>
  /** `GET /v1/policy` */
  policyView: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloRolePolicy>>
  /** `PUT /v1/policy` */
  policyUpdate: (params: {
    body: Json<Api.SiloRolePolicy>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloRolePolicy>>
  /** `GET /v1/projects` */
  projectList: (params: {
    query: Api.ProjectListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ProjectResultsPage>>
  /** `POST /v1/projects` */
  projectCreate: (params: {
    body: Json<Api.ProjectCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Project>>
  /** `GET /v1/projects/:project` */
  projectView: (params: {
    path: Api.ProjectViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Project>>
  /** `PUT /v1/projects/:project` */
  projectUpdate: (params: {
    path: Api.ProjectUpdatePathParams
    body: Json<Api.ProjectUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Project>>
  /** `DELETE /v1/projects/:project` */
  projectDelete: (params: {
    path: Api.ProjectDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/projects/:project/policy` */
  projectPolicyView: (params: {
    path: Api.ProjectPolicyViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ProjectRolePolicy>>
  /** `PUT /v1/projects/:project/policy` */
  projectPolicyUpdate: (params: {
    path: Api.ProjectPolicyUpdatePathParams
    body: Json<Api.ProjectRolePolicy>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.ProjectRolePolicy>>
  /** `GET /v1/snapshots` */
  snapshotList: (params: {
    query: Api.SnapshotListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SnapshotResultsPage>>
  /** `POST /v1/snapshots` */
  snapshotCreate: (params: {
    query: Api.SnapshotCreateQueryParams
    body: Json<Api.SnapshotCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Snapshot>>
  /** `GET /v1/snapshots/:snapshot` */
  snapshotView: (params: {
    path: Api.SnapshotViewPathParams
    query: Api.SnapshotViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Snapshot>>
  /** `DELETE /v1/snapshots/:snapshot` */
  snapshotDelete: (params: {
    path: Api.SnapshotDeletePathParams
    query: Api.SnapshotDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/hardware/disks` */
  physicalDiskList: (params: {
    query: Api.PhysicalDiskListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.PhysicalDiskResultsPage>>
  /** `GET /v1/system/hardware/disks/:diskId` */
  physicalDiskView: (params: {
    path: Api.PhysicalDiskViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.PhysicalDisk>>
  /** `GET /v1/system/hardware/racks` */
  rackList: (params: {
    query: Api.RackListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.RackResultsPage>>
  /** `GET /v1/system/hardware/racks/:rackId` */
  rackView: (params: {
    path: Api.RackViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Rack>>
  /** `GET /v1/system/hardware/sleds` */
  sledList: (params: {
    query: Api.SledListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SledResultsPage>>
  /** `POST /v1/system/hardware/sleds` */
  sledAdd: (params: {
    body: Json<Api.UninitializedSledId>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/hardware/sleds/:sledId` */
  sledView: (params: {
    path: Api.SledViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Sled>>
  /** `GET /v1/system/hardware/sleds/:sledId/disks` */
  sledPhysicalDiskList: (params: {
    path: Api.SledPhysicalDiskListPathParams
    query: Api.SledPhysicalDiskListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.PhysicalDiskResultsPage>>
  /** `GET /v1/system/hardware/sleds/:sledId/instances` */
  sledInstanceList: (params: {
    path: Api.SledInstanceListPathParams
    query: Api.SledInstanceListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SledInstanceResultsPage>>
  /** `PUT /v1/system/hardware/sleds/:sledId/provision-policy` */
  sledSetProvisionPolicy: (params: {
    path: Api.SledSetProvisionPolicyPathParams
    body: Json<Api.SledProvisionPolicyParams>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SledProvisionPolicyResponse>>
  /** `GET /v1/system/hardware/sleds-uninitialized` */
  sledListUninitialized: (params: {
    query: Api.SledListUninitializedQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.UninitializedSledResultsPage>>
  /** `GET /v1/system/hardware/switch-port` */
  networkingSwitchPortList: (params: {
    query: Api.NetworkingSwitchPortListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SwitchPortResultsPage>>
  /** `POST /v1/system/hardware/switch-port/:port/settings` */
  networkingSwitchPortApplySettings: (params: {
    path: Api.NetworkingSwitchPortApplySettingsPathParams
    query: Api.NetworkingSwitchPortApplySettingsQueryParams
    body: Json<Api.SwitchPortApplySettings>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `DELETE /v1/system/hardware/switch-port/:port/settings` */
  networkingSwitchPortClearSettings: (params: {
    path: Api.NetworkingSwitchPortClearSettingsPathParams
    query: Api.NetworkingSwitchPortClearSettingsQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/hardware/switches` */
  switchList: (params: {
    query: Api.SwitchListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SwitchResultsPage>>
  /** `GET /v1/system/hardware/switches/:switchId` */
  switchView: (params: {
    path: Api.SwitchViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Switch>>
  /** `GET /v1/system/identity-providers` */
  siloIdentityProviderList: (params: {
    query: Api.SiloIdentityProviderListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IdentityProviderResultsPage>>
  /** `POST /v1/system/identity-providers/local/users` */
  localIdpUserCreate: (params: {
    query: Api.LocalIdpUserCreateQueryParams
    body: Json<Api.UserCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.User>>
  /** `DELETE /v1/system/identity-providers/local/users/:userId` */
  localIdpUserDelete: (params: {
    path: Api.LocalIdpUserDeletePathParams
    query: Api.LocalIdpUserDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/system/identity-providers/local/users/:userId/set-password` */
  localIdpUserSetPassword: (params: {
    path: Api.LocalIdpUserSetPasswordPathParams
    query: Api.LocalIdpUserSetPasswordQueryParams
    body: Json<Api.UserPassword>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/system/identity-providers/saml` */
  samlIdentityProviderCreate: (params: {
    query: Api.SamlIdentityProviderCreateQueryParams
    body: Json<Api.SamlIdentityProviderCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SamlIdentityProvider>>
  /** `GET /v1/system/identity-providers/saml/:provider` */
  samlIdentityProviderView: (params: {
    path: Api.SamlIdentityProviderViewPathParams
    query: Api.SamlIdentityProviderViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SamlIdentityProvider>>
  /** `GET /v1/system/ip-pools` */
  ipPoolList: (params: {
    query: Api.IpPoolListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolResultsPage>>
  /** `POST /v1/system/ip-pools` */
  ipPoolCreate: (params: {
    body: Json<Api.IpPoolCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPool>>
  /** `GET /v1/system/ip-pools/:pool` */
  ipPoolView: (params: {
    path: Api.IpPoolViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPool>>
  /** `PUT /v1/system/ip-pools/:pool` */
  ipPoolUpdate: (params: {
    path: Api.IpPoolUpdatePathParams
    body: Json<Api.IpPoolUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPool>>
  /** `DELETE /v1/system/ip-pools/:pool` */
  ipPoolDelete: (params: {
    path: Api.IpPoolDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/ip-pools/:pool/ranges` */
  ipPoolRangeList: (params: {
    path: Api.IpPoolRangeListPathParams
    query: Api.IpPoolRangeListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolRangeResultsPage>>
  /** `POST /v1/system/ip-pools/:pool/ranges/add` */
  ipPoolRangeAdd: (params: {
    path: Api.IpPoolRangeAddPathParams
    body: Json<Api.IpRange>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolRange>>
  /** `POST /v1/system/ip-pools/:pool/ranges/remove` */
  ipPoolRangeRemove: (params: {
    path: Api.IpPoolRangeRemovePathParams
    body: Json<Api.IpRange>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/ip-pools/:pool/silos` */
  ipPoolSiloList: (params: {
    path: Api.IpPoolSiloListPathParams
    query: Api.IpPoolSiloListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolSiloLinkResultsPage>>
  /** `POST /v1/system/ip-pools/:pool/silos` */
  ipPoolSiloLink: (params: {
    path: Api.IpPoolSiloLinkPathParams
    body: Json<Api.IpPoolLinkSilo>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolSiloLink>>
  /** `PUT /v1/system/ip-pools/:pool/silos/:silo` */
  ipPoolSiloUpdate: (params: {
    path: Api.IpPoolSiloUpdatePathParams
    body: Json<Api.IpPoolSiloUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolSiloLink>>
  /** `DELETE /v1/system/ip-pools/:pool/silos/:silo` */
  ipPoolSiloUnlink: (params: {
    path: Api.IpPoolSiloUnlinkPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/ip-pools/:pool/utilization` */
  ipPoolUtilizationView: (params: {
    path: Api.IpPoolUtilizationViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolUtilization>>
  /** `GET /v1/system/ip-pools-service` */
  ipPoolServiceView: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPool>>
  /** `GET /v1/system/ip-pools-service/ranges` */
  ipPoolServiceRangeList: (params: {
    query: Api.IpPoolServiceRangeListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolRangeResultsPage>>
  /** `POST /v1/system/ip-pools-service/ranges/add` */
  ipPoolServiceRangeAdd: (params: {
    body: Json<Api.IpRange>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.IpPoolRange>>
  /** `POST /v1/system/ip-pools-service/ranges/remove` */
  ipPoolServiceRangeRemove: (params: {
    body: Json<Api.IpRange>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/metrics/:metricName` */
  systemMetric: (params: {
    path: Api.SystemMetricPathParams
    query: Api.SystemMetricQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.MeasurementResultsPage>>
  /** `GET /v1/system/networking/address-lot` */
  networkingAddressLotList: (params: {
    query: Api.NetworkingAddressLotListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.AddressLotResultsPage>>
  /** `POST /v1/system/networking/address-lot` */
  networkingAddressLotCreate: (params: {
    body: Json<Api.AddressLotCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.AddressLotCreateResponse>>
  /** `DELETE /v1/system/networking/address-lot/:addressLot` */
  networkingAddressLotDelete: (params: {
    path: Api.NetworkingAddressLotDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/networking/address-lot/:addressLot/blocks` */
  networkingAddressLotBlockList: (params: {
    path: Api.NetworkingAddressLotBlockListPathParams
    query: Api.NetworkingAddressLotBlockListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.AddressLotBlockResultsPage>>
  /** `POST /v1/system/networking/bfd-disable` */
  networkingBfdDisable: (params: {
    body: Json<Api.BfdSessionDisable>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `POST /v1/system/networking/bfd-enable` */
  networkingBfdEnable: (params: {
    body: Json<Api.BfdSessionEnable>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/networking/bfd-status` */
  networkingBfdStatus: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BfdStatus[]>>
  /** `GET /v1/system/networking/bgp` */
  networkingBgpConfigList: (params: {
    query: Api.NetworkingBgpConfigListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BgpConfigResultsPage>>
  /** `POST /v1/system/networking/bgp` */
  networkingBgpConfigCreate: (params: {
    body: Json<Api.BgpConfigCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BgpConfig>>
  /** `DELETE /v1/system/networking/bgp` */
  networkingBgpConfigDelete: (params: {
    query: Api.NetworkingBgpConfigDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/networking/bgp-announce` */
  networkingBgpAnnounceSetList: (params: {
    query: Api.NetworkingBgpAnnounceSetListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BgpAnnouncement[]>>
  /** `POST /v1/system/networking/bgp-announce` */
  networkingBgpAnnounceSetCreate: (params: {
    body: Json<Api.BgpAnnounceSetCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BgpAnnounceSet>>
  /** `DELETE /v1/system/networking/bgp-announce` */
  networkingBgpAnnounceSetDelete: (params: {
    query: Api.NetworkingBgpAnnounceSetDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/networking/bgp-message-history` */
  networkingBgpMessageHistory: (params: {
    query: Api.NetworkingBgpMessageHistoryQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.AggregateBgpMessageHistory>>
  /** `GET /v1/system/networking/bgp-routes-ipv4` */
  networkingBgpImportedRoutesIpv4: (params: {
    query: Api.NetworkingBgpImportedRoutesIpv4QueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BgpImportedRouteIpv4[]>>
  /** `GET /v1/system/networking/bgp-status` */
  networkingBgpStatus: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.BgpPeerStatus[]>>
  /** `GET /v1/system/networking/loopback-address` */
  networkingLoopbackAddressList: (params: {
    query: Api.NetworkingLoopbackAddressListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.LoopbackAddressResultsPage>>
  /** `POST /v1/system/networking/loopback-address` */
  networkingLoopbackAddressCreate: (params: {
    body: Json<Api.LoopbackAddressCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.LoopbackAddress>>
  /** `DELETE /v1/system/networking/loopback-address/:rackId/:switchLocation/:address/:subnetMask` */
  networkingLoopbackAddressDelete: (params: {
    path: Api.NetworkingLoopbackAddressDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/networking/switch-port-settings` */
  networkingSwitchPortSettingsList: (params: {
    query: Api.NetworkingSwitchPortSettingsListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SwitchPortSettingsResultsPage>>
  /** `POST /v1/system/networking/switch-port-settings` */
  networkingSwitchPortSettingsCreate: (params: {
    body: Json<Api.SwitchPortSettingsCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SwitchPortSettingsView>>
  /** `DELETE /v1/system/networking/switch-port-settings` */
  networkingSwitchPortSettingsDelete: (params: {
    query: Api.NetworkingSwitchPortSettingsDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/networking/switch-port-settings/:port` */
  networkingSwitchPortSettingsView: (params: {
    path: Api.NetworkingSwitchPortSettingsViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SwitchPortSettingsView>>
  /** `GET /v1/system/policy` */
  systemPolicyView: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FleetRolePolicy>>
  /** `PUT /v1/system/policy` */
  systemPolicyUpdate: (params: {
    body: Json<Api.FleetRolePolicy>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.FleetRolePolicy>>
  /** `GET /v1/system/roles` */
  roleList: (params: {
    query: Api.RoleListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.RoleResultsPage>>
  /** `GET /v1/system/roles/:roleName` */
  roleView: (params: {
    path: Api.RoleViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Role>>
  /** `GET /v1/system/silo-quotas` */
  systemQuotasList: (params: {
    query: Api.SystemQuotasListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloQuotasResultsPage>>
  /** `GET /v1/system/silos` */
  siloList: (params: {
    query: Api.SiloListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloResultsPage>>
  /** `POST /v1/system/silos` */
  siloCreate: (params: {
    body: Json<Api.SiloCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Silo>>
  /** `GET /v1/system/silos/:silo` */
  siloView: (params: {
    path: Api.SiloViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Silo>>
  /** `DELETE /v1/system/silos/:silo` */
  siloDelete: (params: {
    path: Api.SiloDeletePathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/system/silos/:silo/ip-pools` */
  siloIpPoolList: (params: {
    path: Api.SiloIpPoolListPathParams
    query: Api.SiloIpPoolListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloIpPoolResultsPage>>
  /** `GET /v1/system/silos/:silo/policy` */
  siloPolicyView: (params: {
    path: Api.SiloPolicyViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloRolePolicy>>
  /** `PUT /v1/system/silos/:silo/policy` */
  siloPolicyUpdate: (params: {
    path: Api.SiloPolicyUpdatePathParams
    body: Json<Api.SiloRolePolicy>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloRolePolicy>>
  /** `GET /v1/system/silos/:silo/quotas` */
  siloQuotasView: (params: {
    path: Api.SiloQuotasViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloQuotas>>
  /** `PUT /v1/system/silos/:silo/quotas` */
  siloQuotasUpdate: (params: {
    path: Api.SiloQuotasUpdatePathParams
    body: Json<Api.SiloQuotasUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloQuotas>>
  /** `GET /v1/system/users` */
  siloUserList: (params: {
    query: Api.SiloUserListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.UserResultsPage>>
  /** `GET /v1/system/users/:userId` */
  siloUserView: (params: {
    path: Api.SiloUserViewPathParams
    query: Api.SiloUserViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.User>>
  /** `GET /v1/system/users-builtin` */
  userBuiltinList: (params: {
    query: Api.UserBuiltinListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.UserBuiltinResultsPage>>
  /** `GET /v1/system/users-builtin/:user` */
  userBuiltinView: (params: {
    path: Api.UserBuiltinViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.UserBuiltin>>
  /** `GET /v1/system/utilization/silos` */
  siloUtilizationList: (params: {
    query: Api.SiloUtilizationListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloUtilizationResultsPage>>
  /** `GET /v1/system/utilization/silos/:silo` */
  siloUtilizationView: (params: {
    path: Api.SiloUtilizationViewPathParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.SiloUtilization>>
  /** `POST /v1/timeseries/query` */
  timeseriesQuery: (params: {
    body: Json<Api.TimeseriesQuery>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Table[]>>
  /** `GET /v1/timeseries/schema` */
  timeseriesSchemaList: (params: {
    query: Api.TimeseriesSchemaListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.TimeseriesSchemaResultsPage>>
  /** `GET /v1/users` */
  userList: (params: {
    query: Api.UserListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.UserResultsPage>>
  /** `GET /v1/utilization` */
  utilizationView: (params: {
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Utilization>>
  /** `GET /v1/vpc-firewall-rules` */
  vpcFirewallRulesView: (params: {
    query: Api.VpcFirewallRulesViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcFirewallRules>>
  /** `PUT /v1/vpc-firewall-rules` */
  vpcFirewallRulesUpdate: (params: {
    query: Api.VpcFirewallRulesUpdateQueryParams
    body: Json<Api.VpcFirewallRuleUpdateParams>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcFirewallRules>>
  /** `GET /v1/vpc-subnets` */
  vpcSubnetList: (params: {
    query: Api.VpcSubnetListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcSubnetResultsPage>>
  /** `POST /v1/vpc-subnets` */
  vpcSubnetCreate: (params: {
    query: Api.VpcSubnetCreateQueryParams
    body: Json<Api.VpcSubnetCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcSubnet>>
  /** `GET /v1/vpc-subnets/:subnet` */
  vpcSubnetView: (params: {
    path: Api.VpcSubnetViewPathParams
    query: Api.VpcSubnetViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcSubnet>>
  /** `PUT /v1/vpc-subnets/:subnet` */
  vpcSubnetUpdate: (params: {
    path: Api.VpcSubnetUpdatePathParams
    query: Api.VpcSubnetUpdateQueryParams
    body: Json<Api.VpcSubnetUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcSubnet>>
  /** `DELETE /v1/vpc-subnets/:subnet` */
  vpcSubnetDelete: (params: {
    path: Api.VpcSubnetDeletePathParams
    query: Api.VpcSubnetDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
  /** `GET /v1/vpc-subnets/:subnet/network-interfaces` */
  vpcSubnetListNetworkInterfaces: (params: {
    path: Api.VpcSubnetListNetworkInterfacesPathParams
    query: Api.VpcSubnetListNetworkInterfacesQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.InstanceNetworkInterfaceResultsPage>>
  /** `GET /v1/vpcs` */
  vpcList: (params: {
    query: Api.VpcListQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.VpcResultsPage>>
  /** `POST /v1/vpcs` */
  vpcCreate: (params: {
    query: Api.VpcCreateQueryParams
    body: Json<Api.VpcCreate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Vpc>>
  /** `GET /v1/vpcs/:vpc` */
  vpcView: (params: {
    path: Api.VpcViewPathParams
    query: Api.VpcViewQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Vpc>>
  /** `PUT /v1/vpcs/:vpc` */
  vpcUpdate: (params: {
    path: Api.VpcUpdatePathParams
    query: Api.VpcUpdateQueryParams
    body: Json<Api.VpcUpdate>
    req: Request
    cookies: Record<string, string>
  }) => Promisable<HandlerResult<Api.Vpc>>
  /** `DELETE /v1/vpcs/:vpc` */
  vpcDelete: (params: {
    path: Api.VpcDeletePathParams
    query: Api.VpcDeleteQueryParams
    req: Request
    cookies: Record<string, string>
  }) => Promisable<StatusCode>
}

function validateParams<S extends ZodSchema>(
  schema: S,
  req: Request,
  pathParams: PathParams
) {
  const rawParams = new URLSearchParams(new URL(req.url).search)
  const params: [string, unknown][] = []

  // Ensure numeric params like `limit` are parsed as numbers
  for (const [name, value] of rawParams) {
    params.push([name, isNaN(Number(value)) ? value : Number(value)])
  }

  const result = schema.safeParse({
    path: pathParams,
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
  async ({
    request: req,
    params: pathParams,
    cookies,
  }: {
    request: Request
    params: PathParams
    cookies: Record<string, string | string[]>
  }) => {
    const { params, paramsErr } = paramSchema
      ? validateParams(paramSchema, req, pathParams)
      : { params: {}, paramsErr: undefined }
    if (paramsErr) return json(paramsErr, { status: 400 })

    const { path, query } = params

    let body = undefined
    if (bodySchema) {
      const rawBody = await req.json()
      const result = bodySchema.transform(snakeify).safeParse(rawBody)
      if (!result.success) return json(result.error.issues, { status: 400 })
      body = result.data
    }

    try {
      // TypeScript can't narrow the handler down because there's not an explicit relationship between the schema
      // being present and the shape of the handler API. The type of this function could be resolved such that the
      // relevant schema is required if and only if the handler has a type that matches the inferred schema
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (handler as any).apply(null, [
        { path, query, body, req, cookies },
      ])
      if (typeof result === 'number') {
        return new HttpResponse(null, { status: result })
      }
      if (typeof result === 'function') {
        return result()
      }
      if (result instanceof Response) {
        return result
      }
      return json(result)
    } catch (thrown) {
      if (typeof thrown === 'number') {
        return new HttpResponse(null, { status: thrown })
      }
      if (typeof thrown === 'function') {
        return thrown()
      }
      if (typeof thrown === 'string') {
        return json({ message: thrown }, { status: 400 })
      }
      if (thrown instanceof Response) {
        return thrown
      }
      console.error('Unexpected mock error', thrown)
      return json({ message: 'Unknown Server Error' }, { status: 500 })
    }
  }

export function makeHandlers(handlers: MSWHandlers): HttpHandler[] {
  return [
    http.post('/device/auth', handler(handlers['deviceAuthRequest'], null, null)),
    http.post(
      '/device/confirm',
      handler(handlers['deviceAuthConfirm'], null, schema.DeviceAuthVerify)
    ),
    http.post('/device/token', handler(handlers['deviceAccessToken'], null, null)),
    http.get(
      '/experimental/v1/probes',
      handler(handlers['probeList'], schema.ProbeListParams, null)
    ),
    http.post(
      '/experimental/v1/probes',
      handler(handlers['probeCreate'], schema.ProbeCreateParams, schema.ProbeCreate)
    ),
    http.get(
      '/experimental/v1/probes/:probe',
      handler(handlers['probeView'], schema.ProbeViewParams, null)
    ),
    http.delete(
      '/experimental/v1/probes/:probe',
      handler(handlers['probeDelete'], schema.ProbeDeleteParams, null)
    ),
    http.post(
      '/login/:siloName/saml/:providerName',
      handler(handlers['loginSaml'], schema.LoginSamlParams, null)
    ),
    http.get(
      '/v1/certificates',
      handler(handlers['certificateList'], schema.CertificateListParams, null)
    ),
    http.post(
      '/v1/certificates',
      handler(handlers['certificateCreate'], null, schema.CertificateCreate)
    ),
    http.get(
      '/v1/certificates/:certificate',
      handler(handlers['certificateView'], schema.CertificateViewParams, null)
    ),
    http.delete(
      '/v1/certificates/:certificate',
      handler(handlers['certificateDelete'], schema.CertificateDeleteParams, null)
    ),
    http.get('/v1/disks', handler(handlers['diskList'], schema.DiskListParams, null)),
    http.post(
      '/v1/disks',
      handler(handlers['diskCreate'], schema.DiskCreateParams, schema.DiskCreate)
    ),
    http.get('/v1/disks/:disk', handler(handlers['diskView'], schema.DiskViewParams, null)),
    http.delete(
      '/v1/disks/:disk',
      handler(handlers['diskDelete'], schema.DiskDeleteParams, null)
    ),
    http.post(
      '/v1/disks/:disk/bulk-write',
      handler(
        handlers['diskBulkWriteImport'],
        schema.DiskBulkWriteImportParams,
        schema.ImportBlocksBulkWrite
      )
    ),
    http.post(
      '/v1/disks/:disk/bulk-write-start',
      handler(
        handlers['diskBulkWriteImportStart'],
        schema.DiskBulkWriteImportStartParams,
        null
      )
    ),
    http.post(
      '/v1/disks/:disk/bulk-write-stop',
      handler(
        handlers['diskBulkWriteImportStop'],
        schema.DiskBulkWriteImportStopParams,
        null
      )
    ),
    http.post(
      '/v1/disks/:disk/finalize',
      handler(
        handlers['diskFinalizeImport'],
        schema.DiskFinalizeImportParams,
        schema.FinalizeDisk
      )
    ),
    http.get(
      '/v1/disks/:disk/metrics/:metric',
      handler(handlers['diskMetricsList'], schema.DiskMetricsListParams, null)
    ),
    http.get(
      '/v1/floating-ips',
      handler(handlers['floatingIpList'], schema.FloatingIpListParams, null)
    ),
    http.post(
      '/v1/floating-ips',
      handler(
        handlers['floatingIpCreate'],
        schema.FloatingIpCreateParams,
        schema.FloatingIpCreate
      )
    ),
    http.get(
      '/v1/floating-ips/:floatingIp',
      handler(handlers['floatingIpView'], schema.FloatingIpViewParams, null)
    ),
    http.put(
      '/v1/floating-ips/:floatingIp',
      handler(
        handlers['floatingIpUpdate'],
        schema.FloatingIpUpdateParams,
        schema.FloatingIpUpdate
      )
    ),
    http.delete(
      '/v1/floating-ips/:floatingIp',
      handler(handlers['floatingIpDelete'], schema.FloatingIpDeleteParams, null)
    ),
    http.post(
      '/v1/floating-ips/:floatingIp/attach',
      handler(
        handlers['floatingIpAttach'],
        schema.FloatingIpAttachParams,
        schema.FloatingIpAttach
      )
    ),
    http.post(
      '/v1/floating-ips/:floatingIp/detach',
      handler(handlers['floatingIpDetach'], schema.FloatingIpDetachParams, null)
    ),
    http.get('/v1/groups', handler(handlers['groupList'], schema.GroupListParams, null)),
    http.get(
      '/v1/groups/:groupId',
      handler(handlers['groupView'], schema.GroupViewParams, null)
    ),
    http.get('/v1/images', handler(handlers['imageList'], schema.ImageListParams, null)),
    http.post(
      '/v1/images',
      handler(handlers['imageCreate'], schema.ImageCreateParams, schema.ImageCreate)
    ),
    http.get(
      '/v1/images/:image',
      handler(handlers['imageView'], schema.ImageViewParams, null)
    ),
    http.delete(
      '/v1/images/:image',
      handler(handlers['imageDelete'], schema.ImageDeleteParams, null)
    ),
    http.post(
      '/v1/images/:image/demote',
      handler(handlers['imageDemote'], schema.ImageDemoteParams, null)
    ),
    http.post(
      '/v1/images/:image/promote',
      handler(handlers['imagePromote'], schema.ImagePromoteParams, null)
    ),
    http.get(
      '/v1/instances',
      handler(handlers['instanceList'], schema.InstanceListParams, null)
    ),
    http.post(
      '/v1/instances',
      handler(
        handlers['instanceCreate'],
        schema.InstanceCreateParams,
        schema.InstanceCreate
      )
    ),
    http.get(
      '/v1/instances/:instance',
      handler(handlers['instanceView'], schema.InstanceViewParams, null)
    ),
    http.delete(
      '/v1/instances/:instance',
      handler(handlers['instanceDelete'], schema.InstanceDeleteParams, null)
    ),
    http.get(
      '/v1/instances/:instance/disks',
      handler(handlers['instanceDiskList'], schema.InstanceDiskListParams, null)
    ),
    http.post(
      '/v1/instances/:instance/disks/attach',
      handler(
        handlers['instanceDiskAttach'],
        schema.InstanceDiskAttachParams,
        schema.DiskPath
      )
    ),
    http.post(
      '/v1/instances/:instance/disks/detach',
      handler(
        handlers['instanceDiskDetach'],
        schema.InstanceDiskDetachParams,
        schema.DiskPath
      )
    ),
    http.get(
      '/v1/instances/:instance/external-ips',
      handler(handlers['instanceExternalIpList'], schema.InstanceExternalIpListParams, null)
    ),
    http.post(
      '/v1/instances/:instance/external-ips/ephemeral',
      handler(
        handlers['instanceEphemeralIpAttach'],
        schema.InstanceEphemeralIpAttachParams,
        schema.EphemeralIpCreate
      )
    ),
    http.delete(
      '/v1/instances/:instance/external-ips/ephemeral',
      handler(
        handlers['instanceEphemeralIpDetach'],
        schema.InstanceEphemeralIpDetachParams,
        null
      )
    ),
    http.post(
      '/v1/instances/:instance/migrate',
      handler(
        handlers['instanceMigrate'],
        schema.InstanceMigrateParams,
        schema.InstanceMigrate
      )
    ),
    http.post(
      '/v1/instances/:instance/reboot',
      handler(handlers['instanceReboot'], schema.InstanceRebootParams, null)
    ),
    http.get(
      '/v1/instances/:instance/serial-console',
      handler(handlers['instanceSerialConsole'], schema.InstanceSerialConsoleParams, null)
    ),
    http.get(
      '/v1/instances/:instance/serial-console/stream',
      handler(
        handlers['instanceSerialConsoleStream'],
        schema.InstanceSerialConsoleStreamParams,
        null
      )
    ),
    http.get(
      '/v1/instances/:instance/ssh-public-keys',
      handler(
        handlers['instanceSshPublicKeyList'],
        schema.InstanceSshPublicKeyListParams,
        null
      )
    ),
    http.post(
      '/v1/instances/:instance/start',
      handler(handlers['instanceStart'], schema.InstanceStartParams, null)
    ),
    http.post(
      '/v1/instances/:instance/stop',
      handler(handlers['instanceStop'], schema.InstanceStopParams, null)
    ),
    http.get(
      '/v1/ip-pools',
      handler(handlers['projectIpPoolList'], schema.ProjectIpPoolListParams, null)
    ),
    http.get(
      '/v1/ip-pools/:pool',
      handler(handlers['projectIpPoolView'], schema.ProjectIpPoolViewParams, null)
    ),
    http.post(
      '/v1/login/:siloName/local',
      handler(
        handlers['loginLocal'],
        schema.LoginLocalParams,
        schema.UsernamePasswordCredentials
      )
    ),
    http.post('/v1/logout', handler(handlers['logout'], null, null)),
    http.get('/v1/me', handler(handlers['currentUserView'], null, null)),
    http.get(
      '/v1/me/groups',
      handler(handlers['currentUserGroups'], schema.CurrentUserGroupsParams, null)
    ),
    http.get(
      '/v1/me/ssh-keys',
      handler(handlers['currentUserSshKeyList'], schema.CurrentUserSshKeyListParams, null)
    ),
    http.post(
      '/v1/me/ssh-keys',
      handler(handlers['currentUserSshKeyCreate'], null, schema.SshKeyCreate)
    ),
    http.get(
      '/v1/me/ssh-keys/:sshKey',
      handler(handlers['currentUserSshKeyView'], schema.CurrentUserSshKeyViewParams, null)
    ),
    http.delete(
      '/v1/me/ssh-keys/:sshKey',
      handler(
        handlers['currentUserSshKeyDelete'],
        schema.CurrentUserSshKeyDeleteParams,
        null
      )
    ),
    http.get(
      '/v1/metrics/:metricName',
      handler(handlers['siloMetric'], schema.SiloMetricParams, null)
    ),
    http.get(
      '/v1/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceList'],
        schema.InstanceNetworkInterfaceListParams,
        null
      )
    ),
    http.post(
      '/v1/network-interfaces',
      handler(
        handlers['instanceNetworkInterfaceCreate'],
        schema.InstanceNetworkInterfaceCreateParams,
        schema.InstanceNetworkInterfaceCreate
      )
    ),
    http.get(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceView'],
        schema.InstanceNetworkInterfaceViewParams,
        null
      )
    ),
    http.put(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceUpdate'],
        schema.InstanceNetworkInterfaceUpdateParams,
        schema.InstanceNetworkInterfaceUpdate
      )
    ),
    http.delete(
      '/v1/network-interfaces/:interface',
      handler(
        handlers['instanceNetworkInterfaceDelete'],
        schema.InstanceNetworkInterfaceDeleteParams,
        null
      )
    ),
    http.get('/v1/ping', handler(handlers['ping'], null, null)),
    http.get('/v1/policy', handler(handlers['policyView'], null, null)),
    http.put('/v1/policy', handler(handlers['policyUpdate'], null, schema.SiloRolePolicy)),
    http.get(
      '/v1/projects',
      handler(handlers['projectList'], schema.ProjectListParams, null)
    ),
    http.post(
      '/v1/projects',
      handler(handlers['projectCreate'], null, schema.ProjectCreate)
    ),
    http.get(
      '/v1/projects/:project',
      handler(handlers['projectView'], schema.ProjectViewParams, null)
    ),
    http.put(
      '/v1/projects/:project',
      handler(handlers['projectUpdate'], schema.ProjectUpdateParams, schema.ProjectUpdate)
    ),
    http.delete(
      '/v1/projects/:project',
      handler(handlers['projectDelete'], schema.ProjectDeleteParams, null)
    ),
    http.get(
      '/v1/projects/:project/policy',
      handler(handlers['projectPolicyView'], schema.ProjectPolicyViewParams, null)
    ),
    http.put(
      '/v1/projects/:project/policy',
      handler(
        handlers['projectPolicyUpdate'],
        schema.ProjectPolicyUpdateParams,
        schema.ProjectRolePolicy
      )
    ),
    http.get(
      '/v1/snapshots',
      handler(handlers['snapshotList'], schema.SnapshotListParams, null)
    ),
    http.post(
      '/v1/snapshots',
      handler(
        handlers['snapshotCreate'],
        schema.SnapshotCreateParams,
        schema.SnapshotCreate
      )
    ),
    http.get(
      '/v1/snapshots/:snapshot',
      handler(handlers['snapshotView'], schema.SnapshotViewParams, null)
    ),
    http.delete(
      '/v1/snapshots/:snapshot',
      handler(handlers['snapshotDelete'], schema.SnapshotDeleteParams, null)
    ),
    http.get(
      '/v1/system/hardware/disks',
      handler(handlers['physicalDiskList'], schema.PhysicalDiskListParams, null)
    ),
    http.get(
      '/v1/system/hardware/disks/:diskId',
      handler(handlers['physicalDiskView'], schema.PhysicalDiskViewParams, null)
    ),
    http.get(
      '/v1/system/hardware/racks',
      handler(handlers['rackList'], schema.RackListParams, null)
    ),
    http.get(
      '/v1/system/hardware/racks/:rackId',
      handler(handlers['rackView'], schema.RackViewParams, null)
    ),
    http.get(
      '/v1/system/hardware/sleds',
      handler(handlers['sledList'], schema.SledListParams, null)
    ),
    http.post(
      '/v1/system/hardware/sleds',
      handler(handlers['sledAdd'], null, schema.UninitializedSledId)
    ),
    http.get(
      '/v1/system/hardware/sleds/:sledId',
      handler(handlers['sledView'], schema.SledViewParams, null)
    ),
    http.get(
      '/v1/system/hardware/sleds/:sledId/disks',
      handler(handlers['sledPhysicalDiskList'], schema.SledPhysicalDiskListParams, null)
    ),
    http.get(
      '/v1/system/hardware/sleds/:sledId/instances',
      handler(handlers['sledInstanceList'], schema.SledInstanceListParams, null)
    ),
    http.put(
      '/v1/system/hardware/sleds/:sledId/provision-policy',
      handler(
        handlers['sledSetProvisionPolicy'],
        schema.SledSetProvisionPolicyParams,
        schema.SledProvisionPolicyParams
      )
    ),
    http.get(
      '/v1/system/hardware/sleds-uninitialized',
      handler(handlers['sledListUninitialized'], schema.SledListUninitializedParams, null)
    ),
    http.get(
      '/v1/system/hardware/switch-port',
      handler(
        handlers['networkingSwitchPortList'],
        schema.NetworkingSwitchPortListParams,
        null
      )
    ),
    http.post(
      '/v1/system/hardware/switch-port/:port/settings',
      handler(
        handlers['networkingSwitchPortApplySettings'],
        schema.NetworkingSwitchPortApplySettingsParams,
        schema.SwitchPortApplySettings
      )
    ),
    http.delete(
      '/v1/system/hardware/switch-port/:port/settings',
      handler(
        handlers['networkingSwitchPortClearSettings'],
        schema.NetworkingSwitchPortClearSettingsParams,
        null
      )
    ),
    http.get(
      '/v1/system/hardware/switches',
      handler(handlers['switchList'], schema.SwitchListParams, null)
    ),
    http.get(
      '/v1/system/hardware/switches/:switchId',
      handler(handlers['switchView'], schema.SwitchViewParams, null)
    ),
    http.get(
      '/v1/system/identity-providers',
      handler(
        handlers['siloIdentityProviderList'],
        schema.SiloIdentityProviderListParams,
        null
      )
    ),
    http.post(
      '/v1/system/identity-providers/local/users',
      handler(
        handlers['localIdpUserCreate'],
        schema.LocalIdpUserCreateParams,
        schema.UserCreate
      )
    ),
    http.delete(
      '/v1/system/identity-providers/local/users/:userId',
      handler(handlers['localIdpUserDelete'], schema.LocalIdpUserDeleteParams, null)
    ),
    http.post(
      '/v1/system/identity-providers/local/users/:userId/set-password',
      handler(
        handlers['localIdpUserSetPassword'],
        schema.LocalIdpUserSetPasswordParams,
        schema.UserPassword
      )
    ),
    http.post(
      '/v1/system/identity-providers/saml',
      handler(
        handlers['samlIdentityProviderCreate'],
        schema.SamlIdentityProviderCreateParams,
        schema.SamlIdentityProviderCreate
      )
    ),
    http.get(
      '/v1/system/identity-providers/saml/:provider',
      handler(
        handlers['samlIdentityProviderView'],
        schema.SamlIdentityProviderViewParams,
        null
      )
    ),
    http.get(
      '/v1/system/ip-pools',
      handler(handlers['ipPoolList'], schema.IpPoolListParams, null)
    ),
    http.post(
      '/v1/system/ip-pools',
      handler(handlers['ipPoolCreate'], null, schema.IpPoolCreate)
    ),
    http.get(
      '/v1/system/ip-pools/:pool',
      handler(handlers['ipPoolView'], schema.IpPoolViewParams, null)
    ),
    http.put(
      '/v1/system/ip-pools/:pool',
      handler(handlers['ipPoolUpdate'], schema.IpPoolUpdateParams, schema.IpPoolUpdate)
    ),
    http.delete(
      '/v1/system/ip-pools/:pool',
      handler(handlers['ipPoolDelete'], schema.IpPoolDeleteParams, null)
    ),
    http.get(
      '/v1/system/ip-pools/:pool/ranges',
      handler(handlers['ipPoolRangeList'], schema.IpPoolRangeListParams, null)
    ),
    http.post(
      '/v1/system/ip-pools/:pool/ranges/add',
      handler(handlers['ipPoolRangeAdd'], schema.IpPoolRangeAddParams, schema.IpRange)
    ),
    http.post(
      '/v1/system/ip-pools/:pool/ranges/remove',
      handler(handlers['ipPoolRangeRemove'], schema.IpPoolRangeRemoveParams, schema.IpRange)
    ),
    http.get(
      '/v1/system/ip-pools/:pool/silos',
      handler(handlers['ipPoolSiloList'], schema.IpPoolSiloListParams, null)
    ),
    http.post(
      '/v1/system/ip-pools/:pool/silos',
      handler(
        handlers['ipPoolSiloLink'],
        schema.IpPoolSiloLinkParams,
        schema.IpPoolLinkSilo
      )
    ),
    http.put(
      '/v1/system/ip-pools/:pool/silos/:silo',
      handler(
        handlers['ipPoolSiloUpdate'],
        schema.IpPoolSiloUpdateParams,
        schema.IpPoolSiloUpdate
      )
    ),
    http.delete(
      '/v1/system/ip-pools/:pool/silos/:silo',
      handler(handlers['ipPoolSiloUnlink'], schema.IpPoolSiloUnlinkParams, null)
    ),
    http.get(
      '/v1/system/ip-pools/:pool/utilization',
      handler(handlers['ipPoolUtilizationView'], schema.IpPoolUtilizationViewParams, null)
    ),
    http.get(
      '/v1/system/ip-pools-service',
      handler(handlers['ipPoolServiceView'], null, null)
    ),
    http.get(
      '/v1/system/ip-pools-service/ranges',
      handler(handlers['ipPoolServiceRangeList'], schema.IpPoolServiceRangeListParams, null)
    ),
    http.post(
      '/v1/system/ip-pools-service/ranges/add',
      handler(handlers['ipPoolServiceRangeAdd'], null, schema.IpRange)
    ),
    http.post(
      '/v1/system/ip-pools-service/ranges/remove',
      handler(handlers['ipPoolServiceRangeRemove'], null, schema.IpRange)
    ),
    http.get(
      '/v1/system/metrics/:metricName',
      handler(handlers['systemMetric'], schema.SystemMetricParams, null)
    ),
    http.get(
      '/v1/system/networking/address-lot',
      handler(
        handlers['networkingAddressLotList'],
        schema.NetworkingAddressLotListParams,
        null
      )
    ),
    http.post(
      '/v1/system/networking/address-lot',
      handler(handlers['networkingAddressLotCreate'], null, schema.AddressLotCreate)
    ),
    http.delete(
      '/v1/system/networking/address-lot/:addressLot',
      handler(
        handlers['networkingAddressLotDelete'],
        schema.NetworkingAddressLotDeleteParams,
        null
      )
    ),
    http.get(
      '/v1/system/networking/address-lot/:addressLot/blocks',
      handler(
        handlers['networkingAddressLotBlockList'],
        schema.NetworkingAddressLotBlockListParams,
        null
      )
    ),
    http.post(
      '/v1/system/networking/bfd-disable',
      handler(handlers['networkingBfdDisable'], null, schema.BfdSessionDisable)
    ),
    http.post(
      '/v1/system/networking/bfd-enable',
      handler(handlers['networkingBfdEnable'], null, schema.BfdSessionEnable)
    ),
    http.get(
      '/v1/system/networking/bfd-status',
      handler(handlers['networkingBfdStatus'], null, null)
    ),
    http.get(
      '/v1/system/networking/bgp',
      handler(
        handlers['networkingBgpConfigList'],
        schema.NetworkingBgpConfigListParams,
        null
      )
    ),
    http.post(
      '/v1/system/networking/bgp',
      handler(handlers['networkingBgpConfigCreate'], null, schema.BgpConfigCreate)
    ),
    http.delete(
      '/v1/system/networking/bgp',
      handler(
        handlers['networkingBgpConfigDelete'],
        schema.NetworkingBgpConfigDeleteParams,
        null
      )
    ),
    http.get(
      '/v1/system/networking/bgp-announce',
      handler(
        handlers['networkingBgpAnnounceSetList'],
        schema.NetworkingBgpAnnounceSetListParams,
        null
      )
    ),
    http.post(
      '/v1/system/networking/bgp-announce',
      handler(handlers['networkingBgpAnnounceSetCreate'], null, schema.BgpAnnounceSetCreate)
    ),
    http.delete(
      '/v1/system/networking/bgp-announce',
      handler(
        handlers['networkingBgpAnnounceSetDelete'],
        schema.NetworkingBgpAnnounceSetDeleteParams,
        null
      )
    ),
    http.get(
      '/v1/system/networking/bgp-message-history',
      handler(
        handlers['networkingBgpMessageHistory'],
        schema.NetworkingBgpMessageHistoryParams,
        null
      )
    ),
    http.get(
      '/v1/system/networking/bgp-routes-ipv4',
      handler(
        handlers['networkingBgpImportedRoutesIpv4'],
        schema.NetworkingBgpImportedRoutesIpv4Params,
        null
      )
    ),
    http.get(
      '/v1/system/networking/bgp-status',
      handler(handlers['networkingBgpStatus'], null, null)
    ),
    http.get(
      '/v1/system/networking/loopback-address',
      handler(
        handlers['networkingLoopbackAddressList'],
        schema.NetworkingLoopbackAddressListParams,
        null
      )
    ),
    http.post(
      '/v1/system/networking/loopback-address',
      handler(
        handlers['networkingLoopbackAddressCreate'],
        null,
        schema.LoopbackAddressCreate
      )
    ),
    http.delete(
      '/v1/system/networking/loopback-address/:rackId/:switchLocation/:address/:subnetMask',
      handler(
        handlers['networkingLoopbackAddressDelete'],
        schema.NetworkingLoopbackAddressDeleteParams,
        null
      )
    ),
    http.get(
      '/v1/system/networking/switch-port-settings',
      handler(
        handlers['networkingSwitchPortSettingsList'],
        schema.NetworkingSwitchPortSettingsListParams,
        null
      )
    ),
    http.post(
      '/v1/system/networking/switch-port-settings',
      handler(
        handlers['networkingSwitchPortSettingsCreate'],
        null,
        schema.SwitchPortSettingsCreate
      )
    ),
    http.delete(
      '/v1/system/networking/switch-port-settings',
      handler(
        handlers['networkingSwitchPortSettingsDelete'],
        schema.NetworkingSwitchPortSettingsDeleteParams,
        null
      )
    ),
    http.get(
      '/v1/system/networking/switch-port-settings/:port',
      handler(
        handlers['networkingSwitchPortSettingsView'],
        schema.NetworkingSwitchPortSettingsViewParams,
        null
      )
    ),
    http.get('/v1/system/policy', handler(handlers['systemPolicyView'], null, null)),
    http.put(
      '/v1/system/policy',
      handler(handlers['systemPolicyUpdate'], null, schema.FleetRolePolicy)
    ),
    http.get(
      '/v1/system/roles',
      handler(handlers['roleList'], schema.RoleListParams, null)
    ),
    http.get(
      '/v1/system/roles/:roleName',
      handler(handlers['roleView'], schema.RoleViewParams, null)
    ),
    http.get(
      '/v1/system/silo-quotas',
      handler(handlers['systemQuotasList'], schema.SystemQuotasListParams, null)
    ),
    http.get(
      '/v1/system/silos',
      handler(handlers['siloList'], schema.SiloListParams, null)
    ),
    http.post('/v1/system/silos', handler(handlers['siloCreate'], null, schema.SiloCreate)),
    http.get(
      '/v1/system/silos/:silo',
      handler(handlers['siloView'], schema.SiloViewParams, null)
    ),
    http.delete(
      '/v1/system/silos/:silo',
      handler(handlers['siloDelete'], schema.SiloDeleteParams, null)
    ),
    http.get(
      '/v1/system/silos/:silo/ip-pools',
      handler(handlers['siloIpPoolList'], schema.SiloIpPoolListParams, null)
    ),
    http.get(
      '/v1/system/silos/:silo/policy',
      handler(handlers['siloPolicyView'], schema.SiloPolicyViewParams, null)
    ),
    http.put(
      '/v1/system/silos/:silo/policy',
      handler(
        handlers['siloPolicyUpdate'],
        schema.SiloPolicyUpdateParams,
        schema.SiloRolePolicy
      )
    ),
    http.get(
      '/v1/system/silos/:silo/quotas',
      handler(handlers['siloQuotasView'], schema.SiloQuotasViewParams, null)
    ),
    http.put(
      '/v1/system/silos/:silo/quotas',
      handler(
        handlers['siloQuotasUpdate'],
        schema.SiloQuotasUpdateParams,
        schema.SiloQuotasUpdate
      )
    ),
    http.get(
      '/v1/system/users',
      handler(handlers['siloUserList'], schema.SiloUserListParams, null)
    ),
    http.get(
      '/v1/system/users/:userId',
      handler(handlers['siloUserView'], schema.SiloUserViewParams, null)
    ),
    http.get(
      '/v1/system/users-builtin',
      handler(handlers['userBuiltinList'], schema.UserBuiltinListParams, null)
    ),
    http.get(
      '/v1/system/users-builtin/:user',
      handler(handlers['userBuiltinView'], schema.UserBuiltinViewParams, null)
    ),
    http.get(
      '/v1/system/utilization/silos',
      handler(handlers['siloUtilizationList'], schema.SiloUtilizationListParams, null)
    ),
    http.get(
      '/v1/system/utilization/silos/:silo',
      handler(handlers['siloUtilizationView'], schema.SiloUtilizationViewParams, null)
    ),
    http.post(
      '/v1/timeseries/query',
      handler(handlers['timeseriesQuery'], null, schema.TimeseriesQuery)
    ),
    http.get(
      '/v1/timeseries/schema',
      handler(handlers['timeseriesSchemaList'], schema.TimeseriesSchemaListParams, null)
    ),
    http.get('/v1/users', handler(handlers['userList'], schema.UserListParams, null)),
    http.get('/v1/utilization', handler(handlers['utilizationView'], null, null)),
    http.get(
      '/v1/vpc-firewall-rules',
      handler(handlers['vpcFirewallRulesView'], schema.VpcFirewallRulesViewParams, null)
    ),
    http.put(
      '/v1/vpc-firewall-rules',
      handler(
        handlers['vpcFirewallRulesUpdate'],
        schema.VpcFirewallRulesUpdateParams,
        schema.VpcFirewallRuleUpdateParams
      )
    ),
    http.get(
      '/v1/vpc-subnets',
      handler(handlers['vpcSubnetList'], schema.VpcSubnetListParams, null)
    ),
    http.post(
      '/v1/vpc-subnets',
      handler(
        handlers['vpcSubnetCreate'],
        schema.VpcSubnetCreateParams,
        schema.VpcSubnetCreate
      )
    ),
    http.get(
      '/v1/vpc-subnets/:subnet',
      handler(handlers['vpcSubnetView'], schema.VpcSubnetViewParams, null)
    ),
    http.put(
      '/v1/vpc-subnets/:subnet',
      handler(
        handlers['vpcSubnetUpdate'],
        schema.VpcSubnetUpdateParams,
        schema.VpcSubnetUpdate
      )
    ),
    http.delete(
      '/v1/vpc-subnets/:subnet',
      handler(handlers['vpcSubnetDelete'], schema.VpcSubnetDeleteParams, null)
    ),
    http.get(
      '/v1/vpc-subnets/:subnet/network-interfaces',
      handler(
        handlers['vpcSubnetListNetworkInterfaces'],
        schema.VpcSubnetListNetworkInterfacesParams,
        null
      )
    ),
    http.get('/v1/vpcs', handler(handlers['vpcList'], schema.VpcListParams, null)),
    http.post(
      '/v1/vpcs',
      handler(handlers['vpcCreate'], schema.VpcCreateParams, schema.VpcCreate)
    ),
    http.get('/v1/vpcs/:vpc', handler(handlers['vpcView'], schema.VpcViewParams, null)),
    http.put(
      '/v1/vpcs/:vpc',
      handler(handlers['vpcUpdate'], schema.VpcUpdateParams, schema.VpcUpdate)
    ),
    http.delete(
      '/v1/vpcs/:vpc',
      handler(handlers['vpcDelete'], schema.VpcDeleteParams, null)
    ),
  ]
}
