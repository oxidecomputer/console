/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { useState, type ReactNode } from 'react'

import { Success12Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { Modal } from '~/ui/lib/Modal'
import { LearnMore } from '~/ui/lib/SettingsGroup'
import { useTimeout } from '~/ui/lib/use-timeout'
import { links } from '~/util/links'

type CopyCodeProps = {
  code: string
  modalButtonText: string
  copyButtonText: string
  modalTitle: string
  /** rendered code */
  children?: ReactNode
}

export function CopyCode({
  code,
  modalButtonText,
  copyButtonText,
  modalTitle,
  children,
}: CopyCodeProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  function handleDismiss() {
    setIsOpen(false)
  }

  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  const handleCopy = () => {
    window.navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true)
    })
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="ml-2" onClick={() => setIsOpen(true)}>
        {modalButtonText}
      </Button>
      <Modal isOpen={isOpen} onDismiss={handleDismiss} title={modalTitle} width="free">
        <Modal.Section>
          <pre className="w-full rounded border px-4 py-3 !normal-case !tracking-normal text-mono-md bg-default border-secondary">
            {children}
          </pre>
        </Modal.Section>
        <Modal.Footer
          onDismiss={handleDismiss}
          onAction={handleCopy}
          actionText={
            <>
              <span className={hasCopied ? 'invisible' : ''}>{copyButtonText}</span>
              <span
                className={`absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center ${
                  hasCopied ? '' : 'invisible'
                }`}
              >
                <Success12Icon className="mr-2 text-accent" />
                Copied
              </span>
            </>
          }
        >
          <span className="ml-1.5 text-sans-md">
            <LearnMore href={links.oxqlDocs} text="OxQL queries" />
          </span>
        </Modal.Footer>
      </Modal>
    </>
  )
}

type EquivProps = { project: string; instance: string }

export function EquivalentCliCommand({ project, instance }: EquivProps) {
  const cmdParts = [
    'oxide instance serial console',
    `--project ${project}`,
    `--instance ${instance}`,
  ]

  return (
    <CopyCode
      code={cmdParts.join(' ')}
      modalButtonText="Equivalent CLI Command"
      copyButtonText="Copy command"
      modalTitle="CLI command"
    >
      <span className="mr-2 select-none text-tertiary">$</span>
      {cmdParts.join(' \\\n    ')}
    </CopyCode>
  )
}
