/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { subMinutes } from 'date-fns'

import type { AlertClass, AlertDelivery, AlertReceiver } from '@oxide/api'

import type { Json } from './json-type'
import { getTimestamps } from './util'

// Descriptions come from AlertClass in Omicron. Test-only classes are excluded
// from the public list endpoint.
// https://github.com/oxidecomputer/omicron/blob/32615a35/nexus/types/src/alert.rs#L61-L127
export const alertClasses: Json<AlertClass>[] = [
  {
    name: 'hardware.power_shelf.psu.insert',
    description: 'A power supply unit (PSU) has been inserted into a power shelf',
  },
  {
    name: 'hardware.power_shelf.psu.remove',
    description: 'A power supply unit (PSU) has been removed from a power shelf',
  },
  {
    name: 'probe',
    description:
      'Synthetic events sent for webhook receiver liveness probes. Receivers should return 2xx HTTP responses for these events, but they should NOT be treated as notifications of an actual event in the system.',
  },
  // The classes below are mock-only: alerts are system-level events, so these
  // are modeled on Omicron's hardware.power_shelf.psu.* taxonomy and the fault
  // management subsystem (RFD 538 says alerts come from FMA, RFD 307). They
  // are not yet defined in Omicron's alert.rs; they exist to exercise the
  // catalog UI.
  { name: 'hardware.sled.insert', description: 'A sled has been inserted into the rack' },
  { name: 'hardware.sled.remove', description: 'A sled has been removed from the rack' },
  { name: 'hardware.sled.fault', description: 'A sled has reported a hardware fault' },
  {
    name: 'hardware.disk.insert',
    description: 'A physical disk has been inserted into a sled',
  },
  {
    name: 'hardware.disk.remove',
    description: 'A physical disk has been removed from a sled',
  },
  { name: 'hardware.disk.fault', description: 'A physical disk has reported a fault' },
  { name: 'hardware.fan.fault', description: 'A fan has failed or is running out of spec' },
  {
    name: 'hardware.power_shelf.psu.fault',
    description: 'A power supply unit (PSU) has reported a fault',
  },
  {
    name: 'hardware.sensor.overtemp',
    description: 'A temperature sensor has exceeded its critical threshold',
  },
  { name: 'system.update.start', description: 'A system software update has started' },
  { name: 'system.update.complete', description: 'A system software update has completed' },
  { name: 'system.update.fail', description: 'A system software update has failed' },
]

export const receiverWebhook1: Json<AlertReceiver> = {
  id: 'ae2d6e09-9f4d-4dd1-ac54-160d61c7ce42',
  name: 'webhook-1',
  description: 'Main web deployments',
  kind: {
    kind: 'webhook',
    endpoint: 'https://fma.corp.oxide.computer',
    secrets: [
      // distinct timestamps so newest-first ordering is deterministic
      {
        id: '88c7b9bb-fa79-4516-8f12-abebd2626062',
        time_created: '2024-03-01T00:00:00Z',
      },
      {
        id: 'b15f4584-98f1-4cac-b0d3-67294e41aab7',
        time_created: '2024-06-01T00:00:00Z',
      },
    ],
  },
  subscriptions: ['hardware.power_shelf.psu.insert', 'hardware.power_shelf.psu.remove'],
  ...getTimestamps(),
}

export const receiverPowerMon: Json<AlertReceiver> = {
  id: 'c4683abf-664f-4ece-b433-7fd228c1d2ea',
  name: 'power-mon',
  description: '',
  kind: {
    kind: 'webhook',
    endpoint: 'https://power-mon.corp.oxide.computer/webhooks',
    secrets: [
      {
        id: 'bccb6692-d8d4-4d21-822f-50ea7809ef73',
        time_created: new Date().toISOString(),
      },
    ],
  },
  subscriptions: ['hardware.**'],
  ...getTimestamps(),
}

export const receiverGeneral: Json<AlertReceiver> = {
  id: '423059fe-d340-4478-8734-141dbf19dc54',
  name: 'general-sys-webhook',
  description: '',
  kind: {
    kind: 'webhook',
    endpoint: 'https://api.example.dev/hooks/oxide',
    secrets: [
      {
        id: '1a457038-b558-49e9-810b-bda6f73d2b85',
        time_created: new Date().toISOString(),
      },
    ],
  },
  subscriptions: [],
  ...getTimestamps(),
}

// alphabetical by name to match the API's default name_ascending sort. the mock
// paginated() helper preserves array order, so the seed order is the sort order
export const alertReceivers = [receiverGeneral, receiverPowerMon, receiverWebhook1]

const minutesAgo = (n: number) => subMinutes(new Date(), n).toISOString()

// newest first, matching the time_and_id_descending sort the console requests.
// the mock paginated() helper ignores sortBy and preserves array order
export const alertDeliveries: Json<AlertDelivery>[] = [
  {
    id: '9bbdf44f-7dac-4cd0-b4c2-3e622c9693ee',
    alert_id: '391a8e04-a160-4132-a989-6104113311f5',
    alert_class: 'probe',
    receiver_id: receiverWebhook1.id,
    state: 'delivered',
    trigger: 'probe',
    time_started: minutesAgo(5),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'succeeded',
          response: { status: 200, duration_ms: 118 },
          time_sent: minutesAgo(5),
        },
      ],
    },
  },
  {
    id: 'a3d830ee-a590-40df-8281-42282c056196',
    alert_id: '26cb0726-bb32-4a6f-b0a5-b207f75f3cec',
    alert_class: 'hardware.power_shelf.psu.insert',
    receiver_id: receiverWebhook1.id,
    state: 'pending',
    trigger: 'alert',
    time_started: minutesAgo(10),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'failed_unreachable',
          response: null,
          time_sent: minutesAgo(10),
        },
      ],
    },
  },
  {
    id: 'a717b76e-8cac-4f07-b9d9-dfa75e245d53',
    alert_id: '8c8a74ba-58b7-4a06-8c79-39ccad5624fb',
    alert_class: 'hardware.power_shelf.psu.remove',
    receiver_id: receiverWebhook1.id,
    state: 'delivered',
    trigger: 'resend',
    time_started: minutesAgo(60),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'succeeded',
          response: { status: 200, duration_ms: 388 },
          time_sent: minutesAgo(60),
        },
      ],
    },
  },
  {
    id: '30ece63e-5efd-4365-99a6-d4f09dfa685e',
    alert_id: 'beef336d-99db-4b12-ac08-7ebcaab8421a',
    alert_class: 'hardware.power_shelf.psu.insert',
    receiver_id: receiverWebhook1.id,
    state: 'failed',
    trigger: 'alert',
    time_started: minutesAgo(125),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'failed_timeout',
          response: null,
          time_sent: minutesAgo(125),
        },
        {
          attempt: 2,
          result: 'failed_http_error',
          response: { status: 503, duration_ms: 210 },
          time_sent: minutesAgo(120),
        },
        {
          attempt: 3,
          result: 'failed_unreachable',
          response: null,
          time_sent: minutesAgo(115),
        },
      ],
    },
  },
  {
    id: '8a24bc9b-7dbe-4abf-b6a0-b7fdceb6ea26',
    alert_id: '8c8a74ba-58b7-4a06-8c79-39ccad5624fb',
    alert_class: 'hardware.power_shelf.psu.remove',
    receiver_id: receiverWebhook1.id,
    state: 'failed',
    trigger: 'alert',
    time_started: minutesAgo(180),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'failed_http_error',
          response: { status: 500, duration_ms: 152 },
          time_sent: minutesAgo(180),
        },
      ],
    },
  },
  {
    id: 'a71123dd-c817-4abd-88b3-c064e609df49',
    alert_id: '5a2009af-26a0-4217-b18f-bd4e25e691b9',
    alert_class: 'hardware.power_shelf.psu.insert',
    receiver_id: receiverWebhook1.id,
    state: 'delivered',
    trigger: 'alert',
    time_started: minutesAgo(240),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'succeeded',
          response: { status: 200, duration_ms: 275 },
          time_sent: minutesAgo(240),
        },
      ],
    },
  },
  {
    id: '5caa3035-d9d9-4699-831f-383a3e15f59c',
    alert_id: '0d38abba-266b-4220-9975-ae9fe26093e2',
    alert_class: 'hardware.power_shelf.psu.insert',
    receiver_id: receiverPowerMon.id,
    state: 'delivered',
    trigger: 'alert',
    time_started: minutesAgo(30),
    attempts: {
      webhook: [
        {
          attempt: 1,
          result: 'succeeded',
          response: { status: 200, duration_ms: 94 },
          time_sent: minutesAgo(30),
        },
      ],
    },
  },
]
