/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Merge } from 'type-fest'

export type Project = Readonly<{ project?: string }>
export type Instance = Readonly<Merge<Project, { instance?: string }>>
export type Disk = Readonly<Merge<Project, { disk?: string }>>
export type Image = Readonly<Merge<Project, { image?: string }>>
export type SiloImage = Readonly<{ image?: string }>
export type NetworkInterface = Readonly<Merge<Instance, { interface?: string }>>
export type Snapshot = Readonly<Merge<Project, { snapshot?: string }>>
export type Vpc = Readonly<Merge<Project, { vpc?: string }>>
export type VpcRouter = Readonly<Merge<Vpc, { router?: string }>>
export type VpcRouterRoute = Readonly<Merge<VpcRouter, { route?: string }>>
export type VpcSubnet = Readonly<Merge<Vpc, { subnet?: string }>>
export type FirewallRule = Readonly<Merge<Vpc, { rule?: string }>>
export type Silo = Readonly<{ silo?: string }>
export type IdentityProvider = Readonly<Merge<Silo, { provider: string }>>
export type SystemUpdate = Readonly<{ version: string }>
export type SshKey = Readonly<{ sshKey: string }>
export type Sled = Readonly<{ sledId?: string }>
export type IpPool = Readonly<{ pool?: string }>
export type FloatingIp = Readonly<Merge<Project, { floatingIp?: string }>>

export type Id = Readonly<{ id: string }>
