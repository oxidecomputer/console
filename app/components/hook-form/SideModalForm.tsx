import type { FormEventHandler, ReactNode } from 'react'

import { Error12Icon } from '@oxide/ui'
import { Button, SideModal } from '@oxide/ui'

type SideModalFormProps = {
  id: string
  children: ReactNode
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: string
  onSubmit: FormEventHandler<HTMLFormElement>
  submitLabel?: string
}

export function SideModalForm({
  id,
  children,
  onDismiss,
  isOpen,
  submitDisabled = false,
  error,
  title,
  onSubmit,
  submitLabel,
}: SideModalFormProps) {
  return (
    <SideModal onDismiss={onDismiss} isOpen={isOpen} title={title}>
      <SideModal.Body>
        <form
          id={id}
          className="ox-form is-side-modal"
          autoComplete="off"
          onSubmit={onSubmit}
        >
          {children}
        </form>
      </SideModal.Body>
      <SideModal.Footer>
        <div className="flex w-full items-center gap-[0.625rem] children:shrink-0">
          <Button variant="ghost" color="secondary" size="sm" onClick={onDismiss}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitDisabled} form={id}>
            {submitLabel || title}
          </Button>
          {error && (
            <div className="flex !shrink grow items-start justify-end text-mono-sm text-error">
              <Error12Icon className="mx-2 mt-0.5 shrink-0" />
              <span>{error.message}</span>
            </div>
          )}
        </div>
      </SideModal.Footer>
    </SideModal>
  )
}
