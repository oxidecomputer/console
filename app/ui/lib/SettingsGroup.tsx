/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */

import { OpenLink12Icon } from '@oxide/design-system/icons/react'

import { classed } from '~/util/classed'

type LearnMoreProps = {
  href: string
  /** Link text */
  text: React.ReactNode
}

type FooterProps = {
  /** Link text */
  children: React.ReactNode
  docsLink?: { text: string; href: string }
}

/** Use size=sm on buttons and links! */
export const SettingsGroup = {
  Container: classed.div`w-full max-w-[660px] rounded-lg border text-sans-md text-secondary border-default`,
  LearnMore: ({ href, text }: LearnMoreProps) => (
    <div>
      Learn more about{' '}
      <a href={href} className="text-accent-secondary hover:text-accent">
        {text}
        <OpenLink12Icon className="ml-1 align-middle" />
      </a>
    </div>
  ),
  Body: classed.div`p-6`,
  Title: classed.div`mb-1 text-sans-lg text-default`,
  Footer: ({ children, docsLink }: FooterProps) => (
    <div className="flex items-center justify-between border-t px-6 py-3 border-default">
      {/* div always present to keep the buttons right-aligned */}
      <div className="text-tertiary">
        {docsLink && <SettingsGroup.LearnMore {...docsLink} />}
      </div>
      <div className="flex gap-3">{children}</div>
    </div>
  ),
}
