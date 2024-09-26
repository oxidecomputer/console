/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { FieldLabel } from './FieldLabel'

export const Default = () => <FieldLabel id="hi">hello world</FieldLabel>

export const WithTip = () => <FieldLabel id="hi">hello world</FieldLabel>

export const AsLegend = () => (
  <FieldLabel id="hi" as="legend">
    I am legend
  </FieldLabel>
)
