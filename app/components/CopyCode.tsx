/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import { motion as m } from 'framer-motion'
import { useState, type ReactNode } from 'react'

import { Success12Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { Modal } from '~/ui/lib/Modal'
import { useTimeout } from '~/ui/lib/use-timeout'

type CopyCodeProps = {
  code: string
  copyButtonText: string
  modalTitle: string
  footer?: ReactNode
  /** rendered code */
  children?: ReactNode
}

export function CopyCode(props: CopyCodeProps & { modalButtonText: string }) {
  const [isOpen, setIsOpen] = useState(false)

  function handleDismiss() {
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="ml-2" onClick={() => setIsOpen(true)}>
        {props.modalButtonText}
      </Button>
      <CopyCodeModal {...props} isOpen={isOpen} onDismiss={handleDismiss} />
    </>
  )
}

export function CopyCodeModal({
  isOpen,
  onDismiss,
  code,
  copyButtonText,
  modalTitle,
  children,
  footer,
}: CopyCodeProps & { isOpen: boolean; onDismiss: () => void }) {
  const [hasCopied, setHasCopied] = useState(false)
  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  const handleCopy = () => {
    window.navigator.clipboard.writeText(code).then(() => {
      setHasCopied(true)
    })
  }

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} title={modalTitle} width="free">
      <Modal.Section>
        <pre className="w-full rounded border px-4 py-3 !normal-case !tracking-normal text-mono-md bg-default border-secondary">
          {children}
        </pre>
      </Modal.Section>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={handleCopy}
        actionText={
          <>
            <m.span
              className="flex items-center"
              animate={{
                opacity: hasCopied ? 0 : 1,
                y: hasCopied ? 25 : 0,
              }}
              transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
            >
              {copyButtonText}
            </m.span>

            {hasCopied && (
              <m.span
                animate={{ opacity: 1, y: '-50%', x: '-50%' }}
                initial={{ opacity: 0, y: 'calc(-50% - 25px)', x: '-50%' }}
                transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                className="absolute left-1/2 top-1/2 flex items-center"
              >
                <Success12Icon className="text-accent" />
              </m.span>
            )}
          </>
        }
      >
        {footer}
      </Modal.Footer>
    </Modal>
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
