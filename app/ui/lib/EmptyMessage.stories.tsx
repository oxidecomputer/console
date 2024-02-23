/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Instances24Icon } from '@oxide/design-system/icons/react'

import { EmptyMessage } from './EmptyMessage'

export const Default = () => (
  <EmptyMessage
    icon={<Instances24Icon />}
    title="No instances"
    body="You need to create an instance to be able to see it here"
    buttonText="New instance"
    buttonTo="new"
  />
)
