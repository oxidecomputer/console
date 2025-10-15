/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'

export const CopyableIp = ({ ip, isLinked = true }: { ip: string; isLinked?: boolean }) => (
  <span className="flex max-w-full items-center gap-0.5">
    {isLinked ? (
      <a
        className="link-with-underline text-sans-md truncate"
        href={`https://${ip}`}
        target="_blank"
        rel="noreferrer"
      >
        {ip}
      </a>
    ) : (
      <span className="truncate">{ip}</span>
    )}
    <CopyToClipboard text={ip} />
  </span>
)
