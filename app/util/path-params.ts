/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type * as Sel from '~/api/selectors'

// The path versions simply have all params required

export type Project = Required<Sel.Project>
export type Instance = Required<Sel.Instance>
export type Vpc = Required<Sel.Vpc>
export type Silo = Required<Sel.Silo>
export type IdentityProvider = Required<Sel.IdentityProvider>
export type Sled = Required<Sel.Sled>
export type Image = Required<Sel.Image>
export type Snapshot = Required<Sel.Snapshot>
export type SiloImage = Required<Sel.SiloImage>
export type IpPool = Required<Sel.IpPool>
export type FloatingIp = Required<Sel.FloatingIp>
export type FirewallRule = Required<Sel.FirewallRule>
export type VpcRouter = Required<Sel.VpcRouter>
export type VpcRouterRoute = Required<Sel.VpcRouterRoute>
export type VpcSubnet = Required<Sel.VpcSubnet>
export type SshKey = Required<Sel.SshKey>
