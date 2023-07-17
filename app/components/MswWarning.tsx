import { type ReactNode, useState } from 'react'

import { Button, Modal, OpenLink12Icon } from '@oxide/ui'

function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a href={href} className="text-accent" target="_blank" rel="noreferrer">
      {children} <OpenLink12Icon />
    </a>
  )
}

export function MswWarning() {
  const [isOpen, setIsOpen] = useState(false)
  const closeModal = () => setIsOpen(false)
  return (
    <>
      <Button size="sm" variant="danger" className="mr-2" onClick={() => setIsOpen(true)}>
        This is a technical preview
      </Button>
      <Modal isOpen={isOpen} onDismiss={closeModal} title="This is a technical preview">
        <Modal.Section>
          <p>
            This is the <ExternalLink href="https://oxide.computer/">Oxide</ExternalLink>{' '}
            web console running against an in-browser mock API powered by{' '}
            <ExternalLink href="https://mswjs.io/">Mock Service Worker</ExternalLink>. You
            can create mock resources and they will persist across client-side navigations,
            but nobody else can see them and they will disappear on refresh. The console is
            a work in progress.
          </p>
          <p>
            Request and response bodies in the mock API match the Oxide API&apos;s OpenAPI
            spec, but behavior is only mocked in as much detail as is required for
            development and testing of the console and is not fully representative. See the{' '}
            <ExternalLink href="https://github.com/oxidecomputer/oxide.ts">
              oxide.ts
            </ExternalLink>{' '}
            repo for more about the mock API and the{' '}
            <ExternalLink href="https://github.com/oxidecomputer/omicron">
              omicron
            </ExternalLink>{' '}
            repo for more about the real API. The console itself will soon be open source as
            well.
          </p>
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
