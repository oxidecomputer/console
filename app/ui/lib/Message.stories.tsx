/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Message } from './Message'

export const Default = () => (
  <Message
    variant="notice"
    content={
      <>
        If your image supports the <a href="/">cidata volume</a> cloud-init the following
        keys will be added to your instance. Keys are added when the instance is created and
        are not updated after instance launch.
      </>
    }
    cta={{
      text: 'Learn more about SSH keys',
      link: '/',
    }}
  />
)
