/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { v4 as uuid } from 'uuid'

import type { AuditLogEntry } from '@oxide/api'

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

const mockAccessMethods = ['session_cookie', 'api_token', null]

const mockHttpStatusCodes = [200, 201, 204, 400, 401, 403, 404, 409, 500, 502, 503]

const mockSourceIps = [
  '192.168.1.100',
  '10.0.0.50',
  '172.16.0.25',
  '203.0.113.15',
  '198.51.100.42',
]

const mockRequestIds = Array.from({ length: 20 }, () => uuid())

function generateAuditLogEntry(index: number): AuditLogEntry {
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
    accessMethod: mockAccessMethods[index % mockAccessMethods.length],
    actorId: mockUserIds[index % mockUserIds.length],
    actorSiloId: mockSiloIds[index % mockSiloIds.length],
    errorCode: isError ? `E${statusCode}` : null,
    errorMessage: isError ? `Operation failed with status ${statusCode}` : null,
    httpStatusCode: statusCode,
    operationId: operation,
    requestId: mockRequestIds[index % mockRequestIds.length],
    timestamp: baseTime,
    timeCompleted: completedTime,
    requestUri: `/v1/projects/default/${operation.replace('_', '/')}`,
    resourceId: index % 3 === 0 ? uuid() : null,
    sourceIp: mockSourceIps[index % mockSourceIps.length],
  }
}

export const auditLogs: AuditLogEntry[] = [
  // Recent successful operations
  {
    id: uuid(),
    accessMethod: 'session_cookie',
    actorId: mockUserIds[0],
    actorSiloId: mockSiloIds[0],
    errorCode: null,
    errorMessage: null,
    httpStatusCode: 201,
    operationId: 'instance_create',
    requestId: mockRequestIds[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    timeCompleted: new Date(Date.now() - 1000 * 60 * 5 + 321), // 1 second later
    requestUri: '/v1/projects/admin-project/instances',
    resourceId: uuid(),
    sourceIp: '192.168.1.100',
  },
  {
    id: uuid(),
    accessMethod: 'api_token',
    actorId: mockUserIds[1],
    actorSiloId: mockSiloIds[0],
    errorCode: null,
    errorMessage: null,
    httpStatusCode: 200,
    operationId: 'instance_start',
    requestId: mockRequestIds[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 10), // 10 minutes ago
    timeCompleted: new Date(Date.now() - 1000 * 60 * 10 + 126), // 1 second later
    requestUri: '/v1/projects/admin-project/instances/web-server-prod/start',
    resourceId: uuid(),
    sourceIp: '10.0.0.50',
  },
  // Failed operations
  {
    id: uuid(),
    accessMethod: 'session_cookie',
    actorId: mockUserIds[2],
    actorSiloId: mockSiloIds[1],
    errorCode: 'E403',
    errorMessage: 'Insufficient permissions to delete instance',
    httpStatusCode: 403,
    operationId: 'instance_delete',
    requestId: mockRequestIds[2],
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    timeCompleted: new Date(Date.now() - 1000 * 60 * 15 + 147), // 1 second later
    requestUri: '/v1/projects/dev-project/instances/test-instance',
    resourceId: uuid(),
    sourceIp: '172.16.0.25',
  },
  {
    id: uuid(),
    accessMethod: null,
    actorId: null,
    actorSiloId: null,
    errorCode: 'E401',
    errorMessage: 'Authentication required',
    httpStatusCode: 401,
    operationId: 'user_login',
    requestId: mockRequestIds[3],
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    timeCompleted: new Date(Date.now() - 1000 * 60 * 20 + 16), // 1 second later
    requestUri: '/v1/login',
    resourceId: null,
    sourceIp: '203.0.113.15',
  },
  // More historical entries
  {
    id: uuid(),
    accessMethod: 'session_cookie',
    actorId: mockUserIds[0],
    actorSiloId: mockSiloIds[0],
    errorCode: null,
    errorMessage: null,
    httpStatusCode: 201,
    operationId: 'project_create',
    requestId: mockRequestIds[4],
    timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    timeCompleted: new Date(Date.now() - 1000 * 60 * 60 + 36), // 1 second later
    requestUri: '/v1/projects',
    resourceId: uuid(),
    sourceIp: '192.168.1.100',
  },
  // Generate additional entries
  ...Array.from({ length: 199995 }, (_, i) => generateAuditLogEntry(i + 5)),
]
