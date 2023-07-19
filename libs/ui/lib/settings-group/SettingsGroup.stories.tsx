/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { SettingsGroup } from './SettingsGroup'

export const Default = () => (
  <SettingsGroup
    title="Serial Console"
    docs={{ text: 'Serial Console', link: '/' }}
    cta="/"
    ctaText="Connect"
  >
    Connect to your instance&rsquo;s serial console
  </SettingsGroup>
)

export const WithoutDocs = () => (
  <SettingsGroup title="Serial Console" cta="/" ctaText="Connect">
    Connect to your instance&rsquo;s serial console
  </SettingsGroup>
)

export const FunctionAction = () => (
  <SettingsGroup title="Serial Console" cta={() => alert('hi')} ctaText="Connect">
    Connect to your instance&rsquo;s serial console
  </SettingsGroup>
)
