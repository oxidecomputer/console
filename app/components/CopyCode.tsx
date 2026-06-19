/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import * as m from 'motion/react-m'
import { useState, type ReactNode } from 'react'

import { Success12Icon } from '@oxide/design-system/icons/react'

import { Button } from '~/ui/lib/Button'
import { CopyToClipboard } from '~/ui/lib/CopyToClipboard'
import { Modal } from '~/ui/lib/Modal'
import { useTimeout } from '~/ui/lib/use-timeout'

type CopyCodeModalProps = {
  code: string
  copyButtonText: string
  modalTitle: string
  footer?: ReactNode
  /** rendered code */
  children?: ReactNode
  isOpen: boolean
  onDismiss: () => void
}

export function CopyCodeModal({
  isOpen,
  onDismiss,
  code,
  copyButtonText,
  modalTitle,
  children,
  footer,
}: CopyCodeModalProps) {
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
        <pre className="text-mono-md bg-default border-secondary w-full rounded-md border px-4 py-3 tracking-normal! normal-case!">
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
                className="absolute top-1/2 left-1/2 flex items-center"
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

  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setIsOpen(true)}>
        CLI Command
      </Button>
      <CopyCodeModal
        code={cmdParts.join(' ')}
        copyButtonText="Copy command"
        modalTitle="CLI command"
        isOpen={isOpen}
        onDismiss={() => setIsOpen(false)}
      >
        <span className="text-tertiary mr-2 select-none">$</span>
        {cmdParts.join(' \\\n    ')}
      </CopyCodeModal>
    </>
  )
}

type CodeBlock = {
  label: string
  copyAriaLabel: string
  /** Plain text that gets copied to the clipboard */
  code: string
  /** Optional rendered representation; falls back to `code` */
  rendered?: ReactNode
}

type CliCommandModalProps = {
  isOpen: boolean
  onDismiss: () => void
  title: string
  description?: ReactNode
  blocks: [CodeBlock, ...CodeBlock[]]
  footer?: ReactNode
}

/**
 * Modal that stacks one or more code blocks, each with its own copy-to-clipboard
 * button.
 */
export function CliCommandModal({
  isOpen,
  onDismiss,
  title,
  description,
  blocks,
  footer,
}: CliCommandModalProps) {
  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss} title={title} width="free">
      <Modal.Body>
        {description && (
          <Modal.Section>
            <div className="text-sans-md text-secondary">{description}</div>
          </Modal.Section>
        )}
        {blocks.map((block) => (
          <Modal.Section key={block.label}>
            <div className="flex items-center justify-between">
              <div className="text-mono-sm text-secondary">{block.label}</div>
              <CopyToClipboard ariaLabel={block.copyAriaLabel} text={block.code} />
            </div>
            <pre className="text-mono-md bg-default border-secondary max-h-80 w-full overflow-auto rounded-md border px-4 py-3 tracking-normal! normal-case!">
              {block.rendered ?? block.code}
            </pre>
          </Modal.Section>
        ))}
      </Modal.Body>
      <Modal.Footer
        onDismiss={onDismiss}
        onAction={onDismiss}
        actionText="Close"
        showCancel={false}
      >
        {footer}
      </Modal.Footer>
    </Modal>
  )
}
