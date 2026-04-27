/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SSHKeyCreate } from '~/forms/ssh-key-create'
import { titleCrumb } from '~/hooks/use-crumbs'

export const handle = titleCrumb('New SSH key')

export default function SSHKeyCreatePage() {
  return <SSHKeyCreate />
}
