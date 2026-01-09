/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import type { InstanceNetworkInterface } from '@oxide/api'

/**
 * Extract the primary IP address from an instance network interface's IP stack.
 * For dual-stack, returns the IPv4 address.
 */
export function getIpFromStack(nic: InstanceNetworkInterface): string {
  if (nic.ipStack.type === 'dual_stack') {
    return nic.ipStack.value.v4.ip
  }
  return nic.ipStack.value.ip
}

/**
 * Extract transit IPs from an instance network interface's IP stack.
 * For dual-stack, returns the IPv4 transit IPs (since transit IPs are generally version-agnostic in the UI).
 */
export function getTransitIpsFromStack(nic: InstanceNetworkInterface): string[] {
  if (nic.ipStack.type === 'dual_stack') {
    return nic.ipStack.value.v4.transitIps
  }
  return nic.ipStack.value.transitIps
}
