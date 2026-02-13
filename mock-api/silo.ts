/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'

import type {
  IdentityProvider,
  SamlIdentityProvider,
  ScimClientBearerToken,
  Silo,
  SiloAuthSettings,
  SiloQuotas,
} from '@oxide/api'

import { GiB, TiB } from '~/util/units'

import type { Json } from './json-type'

export const silos: Json<Silo[]> = [
  {
    id: '6d3a9c06-475e-4f75-b272-c0d0e3f980fa',
    name: 'maze-war',
    description: 'a silo',
    time_created: new Date(2021, 3, 1).toISOString(),
    time_modified: new Date(2021, 4, 2).toISOString(),
    discoverable: true,
    identity_mode: 'saml_jit',
    mapped_fleet_roles: {
      admin: ['admin'],
    },
  },
  {
    id: '68b58556-15b9-4ccb-adff-9fd3c7de1f9a',
    name: 'myriad',
    description: 'a second silo',
    time_created: new Date(2023, 1, 28).toISOString(),
    time_modified: new Date(2023, 6, 12).toISOString(),
    discoverable: true,
    identity_mode: 'saml_jit',
    mapped_fleet_roles: {},
  },
  // Test silos for IP pool configuration scenarios
  {
    id: '7a1b2c3d-4e5f-4a7b-8c9d-0e1f2a3b4c5d',
    name: 'thrax',
    description: 'silo with v6-only default pool',
    time_created: new Date(2024, 0, 1).toISOString(),
    time_modified: new Date(2024, 0, 2).toISOString(),
    discoverable: false,
    identity_mode: 'saml_jit',
    mapped_fleet_roles: {},
  },
  {
    id: '8b2c3d4e-5f6a-4b8c-9d0e-1f2a3b4c5d6e',
    name: 'pelerines',
    description: 'silo with no default pools',
    time_created: new Date(2024, 0, 3).toISOString(),
    time_modified: new Date(2024, 0, 4).toISOString(),
    discoverable: false,
    identity_mode: 'saml_jit',
    mapped_fleet_roles: {},
  },
  {
    id: '9c3d4e5f-6a7b-4c9d-8e1f-2a3b4c5d6e7f',
    name: 'no-pools',
    description: 'silo with no IP pools',
    time_created: new Date(2024, 0, 11).toISOString(),
    time_modified: new Date(2024, 0, 12).toISOString(),
    discoverable: false,
    identity_mode: 'saml_jit',
    mapped_fleet_roles: {},
  },
]

export const defaultSilo = silos[0]
export const myriadSilo = silos[1]
export const thraxSilo = silos[2]
export const pelerinesSilo = silos[3]
export const noPoolsSilo = silos[4]

export const siloQuotas: Json<SiloQuotas[]> = [
  {
    silo_id: silos[0].id,
    cpus: 50,
    memory: 300 * GiB,
    storage: 7 * TiB,
  },
  {
    silo_id: silos[1].id,
    cpus: 34,
    memory: 500 * GiB,
    storage: 9 * TiB,
  },
  {
    silo_id: silos[2].id,
    cpus: 20,
    memory: 100 * GiB,
    storage: 2 * TiB,
  },
  {
    silo_id: silos[3].id,
    cpus: 20,
    memory: 100 * GiB,
    storage: 2 * TiB,
  },
  {
    silo_id: silos[4].id,
    cpus: 20,
    memory: 100 * GiB,
    storage: 2 * TiB,
  },
]

// unlike siloQuotas, this doesn't exactly match how it's done in Nexus, but
// it's good enough. All we need is to be able to pull the provisioned amounts
// for a given silo. Note it has the same shape as the quotas object.
export const siloProvisioned: Json<SiloQuotas[]> = [
  {
    silo_id: silos[0].id,
    cpus: 30,
    memory: 234 * GiB,
    storage: 4.3 * TiB,
  },
  {
    silo_id: silos[1].id,
    cpus: 8,
    memory: 150 * GiB,
    storage: 2 * TiB,
  },
  {
    silo_id: silos[2].id,
    cpus: 2,
    memory: 16 * GiB,
    storage: 0.5 * TiB,
  },
  {
    silo_id: silos[3].id,
    cpus: 2,
    memory: 16 * GiB,
    storage: 0.5 * TiB,
  },
  {
    silo_id: silos[4].id,
    cpus: 0,
    memory: 0,
    storage: 0,
  },
]

export const samlIdp: Json<SamlIdentityProvider> = {
  id: '2a96ce6f-c178-4631-9cde-607d65b539c7',
  description: 'An identity provider but what if it had a really long description',
  name: 'mock-idp',
  time_created: new Date(2021, 4, 3, 4).toISOString(),
  time_modified: new Date(2021, 4, 3, 5).toISOString(),
  acs_url: '',
  idp_entity_id: '',
  public_cert: '',
  slo_url: '',
  sp_client_id: '',
  technical_contact_email: '',
  group_attribute_name: 'groups',
}

// This works differently from Nexus, but the result is the same. In Nexus,
// there are separate (redundant) tables for IdentityProvider and
// SamlIdentityProvider, plus a join table for (silo_id, idp_id). We can
// accomplish the same thing with a single table.

type DbIdp = {
  type: 'saml'
  siloId: string
  provider: Json<SamlIdentityProvider>
}

export const identityProviders: DbIdp[] = [
  { type: 'saml', siloId: defaultSilo.id, provider: samlIdp },
]

/**
 * Extract generic `IdentityProvider` from a specific `*IdentityProvider`
 * type like `SamlIdentityProvider`
 */
export const toIdp = ({ provider, type }: DbIdp): Json<IdentityProvider> => ({
  provider_type: type,
  ...R.pick(provider, ['id', 'name', 'description', 'time_created', 'time_modified']),
})

export const siloSettings: Json<SiloAuthSettings>[] = [
  {
    silo_id: defaultSilo.id,
    device_token_max_ttl_seconds: 3600 * 24, // 1 hour in seconds
  },
  {
    silo_id: silos[1].id,
    device_token_max_ttl_seconds: 7200, // 2 hours in seconds
  },
  {
    silo_id: silos[2].id,
    device_token_max_ttl_seconds: 3600,
  },
  {
    silo_id: silos[3].id,
    device_token_max_ttl_seconds: 3600,
  },
  {
    silo_id: silos[4].id,
    device_token_max_ttl_seconds: 3600,
  },
]

// SCIM tokens are stored with siloId for filtering, similar to identity providers
type DbScimToken = Json<ScimClientBearerToken> & { siloId: string }

export const scimTokens: DbScimToken[] = [
  {
    id: 'a1b2c3d4-e5f6-4890-abcd-ef1234567890',
    time_created: new Date(2025, 8, 15).toISOString(),
    time_expires: null,
    siloId: defaultSilo.id,
  },
  {
    id: 'b2c3d4e5-f6a7-4901-bcde-f12345678901',
    time_created: new Date(2025, 8, 20).toISOString(),
    time_expires: null,
    siloId: defaultSilo.id,
  },
]
