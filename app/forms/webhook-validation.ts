/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { WEBHOOK_ENDPOINT_MAX_LENGTH } from '@oxide/api'

export const validateEndpoint = (value: string) => {
  // Omicron deserializes the endpoint as a URL.
  // https://github.com/oxidecomputer/omicron/blob/17e6fee/nexus/types/versions/src/initial/alert.rs#L385-L391
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return 'Must be a valid URL, including the scheme (e.g., https://)'
  }
  // Reject schemes that Omicron's HTTP client would refuse at delivery time.
  // https://github.com/oxidecomputer/omicron/blob/17e6fee/nexus/src/app/external_client.rs#L992-L1008
  if (url.protocol !== 'https:' && url.protocol !== 'http:') {
    return 'Must be an HTTP or HTTPS URL'
  }
  // The limit comes from the database column, not API validation.
  // https://github.com/oxidecomputer/omicron/blob/17e6fee/schema/crdb/dbinit.sql#L7384-L7385
  if (value.length > WEBHOOK_ENDPOINT_MAX_LENGTH) {
    return `Must be at most ${WEBHOOK_ENDPOINT_MAX_LENGTH} characters`
  }
}
