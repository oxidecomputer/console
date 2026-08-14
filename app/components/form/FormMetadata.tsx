/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { ReactNode } from 'react'

import { FormDivider } from '~/ui/lib/Divider'
import { PropertiesTable, type ResourceMetadata } from '~/ui/lib/PropertiesTable'

type FormMetadataProps = {
  resource: ResourceMetadata
  /** Resource-specific `PropertiesTable.*` rows, rendered after the standard three */
  children?: ReactNode
}

/**
 * Read-only resource metadata at the top of an edit or view side modal, followed
 * by the divider separating it from the fields. Bundled together so every sidebar
 * gets the same treatment — the divider had already been missed in two forms.
 */
export const FormMetadata = ({ resource, children }: FormMetadataProps) => (
  <>
    <PropertiesTable>
      <PropertiesTable.ResourceRows resource={resource} />
      {children}
    </PropertiesTable>
    <FormDivider />
  </>
)
