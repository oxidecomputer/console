/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Toast } from './Toast'

export const Default = () => (
  <Toast
    variant="success"
    content="7 members have been added"
    onClose={() => alert('onClose')}
    cta={{
      text: 'Learn more',
      link: '/',
    }}
  />
)
