/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { PropertiesTable } from './PropertiesTable'

export const Default = () => (
  <PropertiesTable>
    <PropertiesTable.Row key={1} label="Description">
      Default network for the project
    </PropertiesTable.Row>
    <PropertiesTable.Row key={2} label="Dns Name">
      frontend-production-vpn
    </PropertiesTable.Row>
  </PropertiesTable>
)

export const TwoColumnResponsive = () => (
  <PropertiesTable.Group>
    <PropertiesTable>
      <PropertiesTable.Row label="Description">
        Default network for the project
      </PropertiesTable.Row>
      <PropertiesTable.Row label="Dns Name">frontend-production-vpn</PropertiesTable.Row>
    </PropertiesTable>
    <PropertiesTable>
      <PropertiesTable.Row label="Created">2 Nov 2020, 06:12:52 UTC</PropertiesTable.Row>
      <PropertiesTable.Row label="Last modified">
        14 Nov 2020, 12:21:52 UTC
      </PropertiesTable.Row>
    </PropertiesTable>
  </PropertiesTable.Group>
)
