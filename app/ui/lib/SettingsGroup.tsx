/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { OpenLink12Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

export const LearnMore = ({ href, text }: { href: string; text: React.ReactNode }) => (
  <>
    Learn more about{' '}
    <a
      href={href}
      className="inline-flex items-center text-accent-secondary hover:text-accent"
      target="_blank"
      rel="noreferrer"
    >
      {text}
      <OpenLink12Icon className="ml-1 align-middle" />
    </a>
  </>
)

/** Use size=sm on buttons and links! */
export const SettingsGroup = {
  Container: classed.div`w-full max-w-[660px] rounded-lg border text-sans-md text-secondary border-default`,
  Body: classed.div`p-6`,
  Title: classed.div`mb-1 text-sans-lg text-default`,
  Footer: classed.div`flex items-center justify-between border-t px-6 py-3 border-default h-14`,
}
