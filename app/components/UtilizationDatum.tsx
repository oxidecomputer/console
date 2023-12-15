/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

export const UtilizationDatum = ({
  name,
  amount,
}: {
  name: 'Provisioned' | 'Allocated' | 'Capacity'
  amount: number
}) => (
  <div className="p-3 text-mono-sm">
    <div className="text-quaternary">{name}</div>
    <div className="text-secondary">{amount.toLocaleString()}</div>
  </div>
)
