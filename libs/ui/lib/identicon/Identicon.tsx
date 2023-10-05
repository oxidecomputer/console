/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useMemo } from 'react'

import { generateIdenticon, md5 } from '@oxide/identicon'

type IdenticonProps = {
  /** string used to generate the graphic */
  name: string
  className?: string
}

export function Identicon({ name, className }: IdenticonProps) {
  const content = useMemo(() => generateIdenticon(md5(name)), [name])
  return <div className={className} dangerouslySetInnerHTML={{ __html: content }} />
}
