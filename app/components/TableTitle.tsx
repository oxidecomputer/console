/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const TableTitle = ({ id, text }: { id?: string; text: string }) => (
  <h2 id={id} className="mb-4 text-mono-sm text-secondary">
    {text}
  </h2>
)
