/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { Link } from 'react-router-dom'

import { Button, buttonStyle } from './Button'
import { LearnMore, SettingsGroup } from './SettingsGroup'

export const Default = () => (
  <SettingsGroup.Container>
    <SettingsGroup.Body>
      <SettingsGroup.Title>Serial console</SettingsGroup.Title>
      Connect to your instance&rsquo;s serial console
    </SettingsGroup.Body>
    <SettingsGroup.Footer>
      <LearnMore text="math" href="https://en.wikipedia.org/wiki/Mathematics" />
      <Link to="/" className={buttonStyle({ size: 'sm' })}>
        Connect
      </Link>
    </SettingsGroup.Footer>
  </SettingsGroup.Container>
)

export const WithoutDocs = () => (
  <SettingsGroup.Container>
    <SettingsGroup.Body>
      <SettingsGroup.Title>Serial console</SettingsGroup.Title>
      Connect to your instance&rsquo;s serial console
    </SettingsGroup.Body>
    <SettingsGroup.Footer>
      <Link to="/" className={buttonStyle({ size: 'sm' })}>
        Connect
      </Link>
      <Button size="sm" variant="secondary" onClick={() => {}}>
        Secondary
      </Button>
    </SettingsGroup.Footer>
  </SettingsGroup.Container>
)
