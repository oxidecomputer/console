/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as R from 'remeda'

import type { IdentityProvider, SamlIdentityProvider, Silo, SiloQuotas } from '@oxide/api'

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
]

export const defaultSilo = silos[0]

export const siloQuotas: Json<SiloQuotas[]> = [
  {
    silo_id: silos[0].id,
    cpus: 50,
    memory: 306.55 * GiB,
    storage: 7.91 * TiB,
  },
  {
    silo_id: silos[1].id,
    cpus: 34,
    memory: 500.02 * GiB,
    storage: 9.36 * TiB,
  },
]

// unlike siloQuotas, this doesn't exactly match how it's done in Nexus, but
// it's good enough. All we need is to be able to pull the provisioned amounts
// for a given silo. Note it has the same shape as the quotas object.
export const siloProvisioned: Json<SiloQuotas[]> = [
  {
    silo_id: silos[0].id,
    cpus: 30,
    memory: 234.31 * GiB,
    storage: 4.339 * TiB,
  },
  {
    silo_id: silos[1].id,
    cpus: 8,
    memory: 150.529 * GiB,
    storage: 2.75 * TiB,
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
