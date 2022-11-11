import type { IdentityProvider, Silo } from '@oxide/api'

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

export const idp1: Json<IdentityProvider> = {
  id: '2a96ce6f-c178-4631-9cde-607d65b539c7',
  description: 'An identity provider',
  name: 'mock-idp',
  provider_type: 'saml',
  time_created: new Date(2021, 4, 3).toISOString(),
  time_modified: new Date(2021, 4, 3).toISOString(),
}

export const identityProviders: Json<IdentityProvider[]> = [idp1]

type SiloIdp = {
  siloId: string
  idpId: string
}

export const siloIdps: SiloIdp[] = [{ siloId: defaultSilo.id, idpId: idp1.id }]
