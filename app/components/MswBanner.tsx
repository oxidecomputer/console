/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
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

type Props = {
  /**
   * HACK to avoid the user opening the modal while on the loading skeleton
   * -- it immediately closes when the page finishes loading because the
   * banner is dropped when the HydrateFallback unmounts and re-rendered in
   * RootLayout. A more ideal solution would be to render the banner outside
   * the RouterProvider and therefore have it be the same banner in both the
   * HydrateFallback and normal page situations, but it's a lot more work to
   * get the layout right in that case with respect to things like the loading
   * bar. When we switch to framework mode, we can manage all this in the root
   * route using the Layout export. In the meantime, this is tolerable and only
   * applies to the preview deploys, and only burdens someone who manages to
   * click the Learn More button in the half second before the content loads.
   */
  disableButton?: boolean
}

export function MswBanner({ disableButton }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)
  return (
    <>
      {/* The [&+*]:pt-10 style is to ensure the page container isn't pushed out of screen as it uses 100vh for layout */}
      <aside className="absolute z-topBar flex h-10 w-full items-center justify-center text-sans-md text-info-secondary bg-info-secondary [&+*]:pt-10">
        <Info16Icon className="mr-2" /> This is a technical preview.
        <button
          type="button"
          className="ml-2 flex items-center gap-0.5 text-sans-md hover:text-info"
          onClick={() => setIsOpen(true)}
          disabled={disableButton}
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
        <footer className="flex items-center justify-end border-t px-3 py-3 border-secondary">
          <Button size="sm" onClick={closeModal}>
            Close
          </Button>
        </footer>
      </Modal>
    </>
  )
}
