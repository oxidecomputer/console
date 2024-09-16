/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { Instances16Icon } from '@oxide/design-system/icons/react'

import { docLinks } from '~/util/links'

import { DocsPopover } from './DocsPopover'

export const InstanceDocsPopover = () => (
  <DocsPopover
    heading="instances"
    icon={<Instances16Icon />}
    summary="Instances are virtual machines that run on the Oxide platform."
    links={[docLinks.instances, docLinks.remoteAccess, docLinks.instanceActions]}
  />
)
