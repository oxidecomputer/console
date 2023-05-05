import { useState } from 'react'

import { Button, Modal, Success12Icon, useTimeout } from '@oxide/ui'

export default function EquivalentCliCommand({ command }: { command: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [hasCopied, setHasCopied] = useState(false)

  function handleDismiss() {
    setIsOpen(false)
  }

  useTimeout(() => setHasCopied(false), hasCopied ? 2000 : null)

  const handleCopy = () => {
    window.navigator.clipboard.writeText(command).then(() => {
      setHasCopied(true)
    })
  }

  return (
    <>
      <Button variant="ghost" size="sm" className="ml-2" onClick={() => setIsOpen(true)}>
        Equivalent CLI Command
      </Button>
      <Modal isOpen={isOpen} onDismiss={handleDismiss}>
        <Modal.Title>CLI Command</Modal.Title>

        <Modal.Section>
          {/* todo: fix the token to disable contextual alternates in the mono font */}
          <pre className="flex w-full rounded border px-4 py-3 !normal-case !tracking-normal text-mono-md bg-default border-secondary [font-feature-settings:_'calt'_off]">
            <div className="mr-2 select-none text-quaternary">$</div>
            {command}
          </pre>
        </Modal.Section>
        <Modal.Footer
          onDismiss={handleDismiss}
          onAction={handleCopy}
          actionText={
            <>
              <span className={hasCopied ? 'invisible' : ''}>Copy command</span>
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
        />
      </Modal>
    </>
  )
}