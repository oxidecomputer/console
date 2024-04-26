/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// https://github.com/remix-run/react-router/blob/9e7486b8/docs/route/lazy.md#multiple-routes-in-a-single-file

export * as SystemLayout from '~/layouts/SystemLayout'

export * as SiloPage from './silos/SiloPage'
export * as SilosPage from './silos/SilosPage'
export * as UtilizationPage from './UtilizationPage'
export * as InventoryPage from './inventory/InventoryPage'
export * as SledsTab from './inventory/SledsTab'
export * as DisksTab from './inventory/DisksTab'
export * as SledPage from './inventory/sled/SledPage'
export * as SledInstancesTab from './inventory/sled/SledInstancesTab'
export * as IpPoolPage from './networking/IpPoolPage'
export * as IpPoolsPage from './networking/IpPoolsPage'
