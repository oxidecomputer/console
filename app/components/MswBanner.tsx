/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import cn from 'classnames'
import { useState, type ReactNode } from 'react'

import { Info16Icon, NextArrow12Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { Modal } from '~/ui/lib/Modal'
import { ModalLink, ModalLinks } from '~/ui/lib/ModalLinks'

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="text-accent-secondary hover:text-accent"
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  )
}

/**
 * Renders the preview banner (when enabled at build time) and sets
 * `--preview-banner-height` for the rest of the app. The banner is `fixed`, so
 * it can't push anything down through normal flow. Instead, the fixed-position
 * chrome (top bar, sidebar) and viewport-height calcs consume the variable to
 * offset themselves, the same way they use `--top-bar-height`. When the banner
 * is off, the variable stays at its 0px default (set in index.css) and the
 * offsets collapse to nothing, so consumers don't need their own conditionals.
 *
 * Rendered once in main.tsx, outside the router, so the same banner instance
 * persists across hydration (skeleton to real page) and error states.
 */
export function PreviewBannerLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={cn('h-full', process.env.MSW_BANNER && '[--preview-banner-height:2.5rem]')}
    >
      {process.env.MSW_BANNER ? <MswBanner /> : null}
      {children}
    </div>
  )
}

function MswBanner() {
  const [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)
  return (
    <>
      <aside className="text-sans-md text-info bg-info fixed top-0 z-(--z-top-bar) flex h-(--preview-banner-height) w-full items-center justify-center">
        <Info16Icon className="mr-2" /> This is a technical preview.
        <button
          type="button"
          className="text-sans-md hover:text-info ml-2 flex items-center gap-0.5"
          onClick={() => setIsOpen(true)}
        >
          Learn more <NextArrow12Icon />
        </button>
      </aside>
      <Modal isOpen={isOpen} onDismiss={closeModal} title="Console Technical Preview">
        <Modal.Section>
          <p>
            This is the <ExternalLink href="https://oxide.computer/">Oxide</ExternalLink>{' '}
            web console running against an in-browser mock API powered by{' '}
            <ExternalLink href="https://mswjs.io/">Mock Service Worker</ExternalLink>. You
            can create mock resources and they will persist across client-side navigations,
            but nobody else can see them and they will disappear on refresh.
          </p>
          <p>
            Request and response bodies in the mock API match the{' '}
            <ExternalLink href="https://github.com/oxidecomputer/omicron/blob/main/openapi/nexus.json">
              OpenAPI document
            </ExternalLink>
            . Behavior is only mocked in as much detail as is required for console
            development and testing and is not fully representative.
          </p>
        </Modal.Section>
        <Modal.Section>
          <ModalLinks heading="Relevant repositories">
            <ModalLink to="https://github.com/oxidecomputer/console" label="Web console" />
            <ModalLink
              to="https://github.com/oxidecomputer/oxide.ts"
              label="TypeScript API client generator"
            />
            <ModalLink
              to="https://github.com/oxidecomputer/omicron"
              label="Control plane and API"
            />
          </ModalLinks>
        </Modal.Section>
        <footer className="border-secondary flex items-center justify-end border-t px-3 py-3">
          <Button size="sm" onClick={closeModal}>
            Close
          </Button>
        </footer>
      </Modal>
    </>
  )
}
