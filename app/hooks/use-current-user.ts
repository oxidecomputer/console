/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { api, apiq, usePrefetchedQuery } from '~/api/client'

/**
 * Access all the data fetched by the loader. Because of the `shouldRevalidate`
 * trick, that loader runs on every authenticated page, which means callers do
 * not have to worry about hitting these endpoints themselves in their own
 * loaders.
 */
export function useCurrentUser() {
  const { data: me } = usePrefetchedQuery(apiq(api.methods.currentUserView, {}))
  const { data: myGroups } = usePrefetchedQuery(apiq(api.methods.currentUserGroups, {}))
  return { me, myGroups }
}
