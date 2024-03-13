/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
export const links: Record<string, string> = {
  cloudInitFormat: 'https://cloudinit.readthedocs.io/en/latest/explanation/format.html',
  cloudInitExamples: 'https://cloudinit.readthedocs.io/en/latest/reference/examples.html',
  ipPoolsDocs: 'https://docs.oxide.computer/guides/operator/ip-pool-management',
}

// Resource creation pages (e.g. /instances-new) don't have a route that matches the top-level resource name,
// so `isActive` won't ever fire as true, and the Sidebar won't highlight the correct resource.
// Determine, for a given Sidebar URL, whether it's the matching top-level resource URL for the current page.
export const isRootResourceLink = (navUrl: string, locationPathname: string): boolean =>
  locationPathname === `${navUrl}-new`
