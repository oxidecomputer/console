/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { TimeseriesSchema } from '@oxide/api'

import type { Json } from './json-type'

// Field sets are trimmed-down versions of the real schemas in Omicron; they
// only need to be realistic enough to exercise editor autocomplete and any
// future schema browsing UI.
// https://github.com/oxidecomputer/omicron/blob/main/oximeter/oximeter/schema/hardware-component.toml
// https://github.com/oxidecomputer/omicron/blob/main/oximeter/oximeter/schema/sled-data-link.toml

const hardwareComponentFields: Json<TimeseriesSchema>['field_schema'] = [
  {
    name: 'rack_id',
    field_type: 'uuid',
    source: 'target',
    description: 'ID of the rack containing the component',
  },
  {
    name: 'sled_id',
    field_type: 'uuid',
    source: 'target',
    description: 'ID of the sled reporting the component',
  },
  {
    name: 'chassis_kind',
    field_type: 'string',
    source: 'target',
    description: 'What kind of thing the component is a part of',
  },
  {
    name: 'chassis_serial',
    field_type: 'string',
    source: 'target',
    description: 'Serial number of the chassis',
  },
  {
    name: 'slot',
    field_type: 'u32',
    source: 'target',
    description: 'Slot number of the chassis',
  },
  {
    name: 'component_id',
    field_type: 'string',
    source: 'target',
    description: 'ID of the component',
  },
  {
    name: 'sensor',
    field_type: 'string',
    source: 'metric',
    description: 'Name of the sensor',
  },
]

const sledDataLinkFields: Json<TimeseriesSchema>['field_schema'] = [
  {
    name: 'rack_id',
    field_type: 'uuid',
    source: 'target',
    description: 'ID of the rack containing the link',
  },
  {
    name: 'sled_id',
    field_type: 'uuid',
    source: 'target',
    description: 'ID of the sled containing the link',
  },
  {
    name: 'serial',
    field_type: 'string',
    source: 'target',
    description: 'Serial number of the sled',
  },
  {
    name: 'kind',
    field_type: 'string',
    source: 'target',
    description: 'Kind of the data link (physical or virtual)',
  },
  {
    name: 'link_name',
    field_type: 'string',
    source: 'target',
    description: 'Name of the data link',
  },
]

const common = {
  authz_scope: 'fleet',
  version: 1,
  created: '2025-01-01T00:00:00Z',
} as const

export const timeseriesSchemas: Json<TimeseriesSchema>[] = [
  {
    ...common,
    timeseries_name: 'hardware_component:fan_speed',
    description: {
      target: 'A hardware component on a compute sled, switch, or power shelf',
      metric: 'A fan speed measurement',
    },
    field_schema: hardwareComponentFields,
    datum_type: 'f32',
    units: 'rpm',
  },
  {
    ...common,
    timeseries_name: 'hardware_component:temperature',
    description: {
      target: 'A hardware component on a compute sled, switch, or power shelf',
      metric: 'A temperature measurement',
    },
    field_schema: hardwareComponentFields,
    datum_type: 'f32',
    units: 'degrees_celsius',
  },
  {
    ...common,
    timeseries_name: 'hardware_component:amd_cpu_tctl',
    description: {
      target: 'A hardware component on a compute sled, switch, or power shelf',
      metric: 'A CPU Tctl reading (dimensionless)',
    },
    field_schema: hardwareComponentFields,
    datum_type: 'f32',
    units: 'none',
  },
  {
    ...common,
    timeseries_name: 'sled_data_link:bytes_sent',
    description: {
      target: 'A network data link on a compute sled',
      metric: 'Total number of bytes sent on the link',
    },
    field_schema: sledDataLinkFields,
    datum_type: 'cumulative_u64',
    units: 'bytes',
  },
  {
    ...common,
    timeseries_name: 'sled_data_link:bytes_received',
    description: {
      target: 'A network data link on a compute sled',
      metric: 'Total number of bytes received on the link',
    },
    field_schema: sledDataLinkFields,
    datum_type: 'cumulative_u64',
    units: 'bytes',
  },
]
