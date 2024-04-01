/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useQuery } from '@tanstack/react-query'

import { getLog, LOG_KEY } from '~/api/log'
import { PageHeader, PageTitle } from '~/ui/lib/PageHeader'

export function DebugLog() {
  const { data: log } = useQuery({ queryKey: [LOG_KEY], queryFn: getLog })
  return (
    <>
      <PageHeader>
        <PageTitle>API Error Log</PageTitle>
      </PageHeader>
      {log ? (
        <ul>
          {log.map((item) => (
            <li key={item.timestamp.toISOString()}>
              <code>{item.type === 'error' ? item.data.message : item.type}</code>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  )
}
