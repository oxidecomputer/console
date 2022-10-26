import type { FormEventHandler, ReactNode } from 'react'

import { SideModal } from '@oxide/ui'

// note we're using the things that hang off of Form but not Form itself
import { Form } from 'app/components/form'

type SideModalFormProps = {
  id: string
  children: ReactNode
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: ReactNode
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
    <SideModal id={`${id}-modal`} onDismiss={onDismiss} isOpen={isOpen}>
      {title && <SideModal.Title id={`${id}-title`}>{title}</SideModal.Title>}
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
        <Form.Actions
          formId={id}
          submitDisabled={submitDisabled}
          error={error}
          className="flex-row-reverse"
        >
          <Form.Submit>{submitLabel || title}</Form.Submit>
          <Form.Cancel onClick={onDismiss} />
        </Form.Actions>
      </SideModal.Footer>
    </SideModal>
  )
}
