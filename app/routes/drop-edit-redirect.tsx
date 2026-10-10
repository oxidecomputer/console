/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Navigate, useLocation } from 'react-router'

export default function DropEditRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={pathname.replace(/\/edit$/, '')} replace />
}
