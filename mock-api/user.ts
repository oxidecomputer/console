/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { User } from '@oxide/api'

import type { Json } from './json-type'
import { defaultSilo } from './silo'

export const user1: Json<User> = {
  id: '2e28576d-43e0-4e9e-9132-838a7b66f602',
  display_name: 'Hannah Arendt',
  silo_id: defaultSilo.id,
}

export const user2: Json<User> = {
  id: '6937b251-013c-4f96-9afc-c62b1318dd0b',
  display_name: 'Hans Jonas',
  silo_id: defaultSilo.id,
}

export const user3: Json<User> = {
  id: '4962021b-35e1-44a7-a40c-2264cd540615',
  display_name: 'Jacob Klein',
  silo_id: defaultSilo.id,
}

export const user4: Json<User> = {
  id: '37c6aa2f-899e-4d56-bad1-93b5526a7151',
  display_name: 'Simone de Beauvoir',
  silo_id: defaultSilo.id,
}

export const user5: Json<User> = {
  id: 'e7ab4cc1-a7c6-43df-8f69-84bb507c4d22',
  display_name: 'Jane Austen',
  silo_id: defaultSilo.id,
}

export const user6: Json<User> = {
  id: 'f8c2b4d3-6e7a-4b9c-8d1e-3a4f5b6c7d8e',
  display_name: 'Herbert Marcuse',
  silo_id: defaultSilo.id,
}

export const users = [user1, user2, user3, user4, user5, user6]
