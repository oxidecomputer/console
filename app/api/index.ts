/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

// for convenience so we can do `import type { ApiTypes } from '@oxide/api'`
import type * as ApiTypes from './__generated__/Api'

export * from './client'
export * from './roles'
export * from './util'
export * from './__generated__/Api'
// export * as ZVal from './__generated__/validate'

export type { ApiTypes }

export * as PathParams from './path-params'

export type { Params, Result, ResultItem } from './hooks'
export type { ApiError } from './errors'
export { navToLogin } from './nav-to-login'
