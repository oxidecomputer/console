/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { Merge } from 'type-fest'

export type Project = { project?: string }
export type Instance = Merge<Project, { instance?: string }>
export type Disk = Merge<Project, { disk?: string }>
export type Image = Merge<Project, { image?: string }>
export type SiloImage = { image?: string }
export type NetworkInterface = Merge<Instance, { interface?: string }>
export type Snapshot = Merge<Project, { snapshot?: string }>
export type Vpc = Merge<Project, { vpc?: string }>
export type VpcSubnet = Merge<Vpc, { subnet?: string }>
export type VpcRouter = Merge<Vpc, { router?: string }>
export type RouterRoute = Merge<VpcRouter, { route?: string }>
export type Silo = { silo?: string }
export type IdentityProvider = Merge<Silo, { provider: string }>
export type SystemUpdate = { version: string }
export type SshKey = { sshKey: string }
export type Sled = { sledId?: string }

export type Id = { id: string }
