/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Folder24Icon } from '@oxide/design-system/icons/react'

import { PageHeader, PageTitle } from './PageHeader'

export const Default = () => (
  <PageHeader>
    <PageTitle icon={<Folder24Icon />}>This is a test</PageTitle>
  </PageHeader>
)
