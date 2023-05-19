import type { IdentityProvider, SamlIdentityProvider, Silo } from '@oxide/api'
import { pick } from '@oxide/util'

import type { Json } from './json-type'

export const silos: Json<Silo[]> = [
  {
    id: '6d3a9c06-475e-4f75-b272-c0d0e3f980fa',
    name: 'default-silo',
    description: 'a fake default silo',
    time_created: new Date(2021, 3, 1).toISOString(),
    time_modified: new Date(2021, 4, 2).toISOString(),
    discoverable: true,
    identity_mode: 'saml_jit',
  },
]

export const defaultSilo = silos[0]

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
  ...pick(provider, 'id', 'name', 'description', 'time_created', 'time_modified'),
})
