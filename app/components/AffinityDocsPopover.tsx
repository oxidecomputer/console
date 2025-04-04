/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Affinity16Icon } from '@oxide/design-system/icons/react'

import { policyHelpText } from '~/forms/affinity-util'
import { TipIcon } from '~/ui/lib/TipIcon'
import { docLinks } from '~/util/links'

import { DocsPopover } from './DocsPopover'

export const AffinityDocsPopover = () => (
  <DocsPopover
    heading="affinity"
    icon={<Affinity16Icon />}
    summary="Instances in an anti-affinity group will be placed on different sleds when they start."
    links={[docLinks.affinity]}
  />
)

export const AffinityPolicyHeader = () => (
  <>
    Policy<TipIcon className="ml-1.5">{policyHelpText}</TipIcon>
  </>
)
