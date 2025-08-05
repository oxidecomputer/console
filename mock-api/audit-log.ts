/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { v4 as uuid } from 'uuid'

import type { AuditLogEntry } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

const mockUserIds = [
  'a47ac10b-58cc-4372-a567-0e02b2c3d479',
  '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
  'c73bcdcc-2669-4bf6-81d3-e4ae73fb11fd',
  '550e8400-e29b-41d4-a716-446655440000',
]

const mockSiloIds = [
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '7ba7b810-9dad-11d1-80b4-00c04fd430c8',
]

const mockOperations = [
  'instance_create',
  'instance_delete',
  'instance_start',
  'instance_stop',
  'instance_reboot',
  'project_create',
  'project_delete',
  'project_update',
  'disk_create',
  'disk_delete',
  'disk_attach',
  'disk_detach',
  'image_create',
  'image_delete',
  'image_promote',
  'image_demote',
  'vpc_create',
  'vpc_delete',
  'vpc_update',
  'floating_ip_create',
  'floating_ip_delete',
  'floating_ip_attach',
  'floating_ip_detach',
  'snapshot_create',
  'snapshot_delete',
  'silo_create',
  'silo_delete',
  'user_login',
  'user_logout',
  'ssh_key_create',
  'ssh_key_delete',
]

const mockAccessMethod = ['session_cookie', 'api_token', null]

const mockHttpStatusCodes = [200, 201, 204, 400, 401, 403, 404, 409, 500, 502, 503]

const mockSourceIps = [
  '192.168.1.100',
  '10.0.0.50',
  '172.16.0.25',
  '203.0.113.15',
  '198.51.100.42',
]

const mockRequestIds = Array.from({ length: 20 }, () => uuid())

function generateAuditLogEntry(index: number): Json<AuditLogEntry> {
  const operation = mockOperations[index % mockOperations.length]
  const statusCode = mockHttpStatusCodes[index % mockHttpStatusCodes.length]
  const isError = statusCode >= 400
  const baseTime = new Date()
  baseTime.setSeconds(baseTime.getSeconds() - index * 5 * 1) // Spread entries over time

  const completedTime = new Date(baseTime)
  completedTime.setMilliseconds(
    Math.abs(Math.sin(index)) * 300 + completedTime.getMilliseconds()
  ) // Deterministic random durations

  return {
    id: uuid(),
    access_method: mockAccessMethod[index % mockAccessMethod.length],
    actor: {
      kind: 'silo_user',
      silo_id: defaultSilo.id,
      silo_user_id: mockUserIds[index % mockUserIds.length],
    },
    result: isError
      ? {
          kind: 'error',
          error_code: `E${statusCode}`,
          error_message: `Operation failed with status ${statusCode}`,
          http_status_code: statusCode,
        }
      : { kind: 'success', http_status_code: statusCode },
    operation_id: operation,
    request_id: mockRequestIds[index % mockRequestIds.length],
    time_started: baseTime.toISOString(),
    time_completed: completedTime.toISOString(),
    request_uri: `/v1/projects/default/${operation.replace('_', '/')}`,
    source_ip: mockSourceIps[index % mockSourceIps.length],
  }
}

export const auditLog: Json<AuditLogEntry[]> = [
  // Recent successful operations
  {
    id: uuid(),
    access_method: 'session_cookie',
    actor: {
      kind: 'silo_user',
      silo_id: defaultSilo.id,
      silo_user_id: mockUserIds[0],
    },
    result: { kind: 'success', http_status_code: 201 },
    operation_id: 'instance_create',
    request_id: mockRequestIds[0],
    time_started: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
    time_completed: new Date(Date.now() - 1000 * 60 * 5 + 321).toISOString(), // 1 second later
    request_uri: '/v1/projects/admin-project/instances',
    source_ip: '192.168.1.100',
  },
  {
    id: uuid(),
    access_method: 'api_token',
    actor: {
      kind: 'silo_user',
      silo_id: defaultSilo.id,
      silo_user_id: mockUserIds[1],
    },
    result: { kind: 'success', http_status_code: 200 },
    operation_id: 'instance_start',
    request_id: mockRequestIds[1],
    time_started: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
    time_completed: new Date(Date.now() - 1000 * 60 * 10 + 126).toISOString(), // 1 second later
    request_uri: '/v1/projects/admin-project/instances/web-server-prod/start',
    source_ip: '10.0.0.50',
  },
  // Failed operations
  {
    id: uuid(),
    access_method: 'session_cookie',
    actor: {
      kind: 'silo_user',
      silo_id: mockSiloIds[1],
      silo_user_id: mockUserIds[2],
    },
    result: {
      kind: 'error',
      error_code: 'E403',
      error_message: 'Insufficient permissions to delete instance',
      http_status_code: 403,
    },
    operation_id: 'instance_delete',
    request_id: mockRequestIds[2],
    time_started: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
    time_completed: new Date(Date.now() - 1000 * 60 * 15 + 147).toISOString(), // 1 second later
    request_uri: '/v1/projects/dev-project/instances/test-instance',
    source_ip: '172.16.0.25',
  },
  {
    id: uuid(),
    access_method: null,
    actor: { kind: 'unauthenticated' },
    result: {
      kind: 'error',
      error_code: 'E401',
      error_message: 'Authentication required',
      http_status_code: 401,
    },
    operation_id: 'user_login',
    request_id: mockRequestIds[3],
    time_started: new Date(Date.now() - 1000 * 60 * 20).toISOString(), // 20 minutes ago
    time_completed: new Date(Date.now() - 1000 * 60 * 20 + 16).toISOString(), // 1 second later
    request_uri: '/v1/login',
    source_ip: '203.0.113.15',
  },
  // More historical entries
  {
    id: uuid(),
    access_method: 'session_cookie',
    actor: {
      kind: 'silo_user',
      silo_id: mockSiloIds[0],
      silo_user_id: mockUserIds[0],
    },
    result: { kind: 'success', http_status_code: 201 },
    operation_id: 'project_create',
    request_id: mockRequestIds[4],
    time_started: new Date(Date.now() - 1000 * 60 * 60).toISOString(), // 1 hour ago
    time_completed: new Date(Date.now() - 1000 * 60 * 60 + 36).toISOString(), // 1 second later
    request_uri: '/v1/projects',
    source_ip: '192.168.1.100',
  },
  // Generate additional entries
  ...Array.from({ length: 4995 }, (_, i) => generateAuditLogEntry(i + 5)),
]
