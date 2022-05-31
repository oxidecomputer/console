import { SideModal } from '@oxide/ui'
import { flattenChildren, pluckFirstOfType } from '@oxide/util'
import type { ReactNode } from 'react'
import type { FormProps } from './Form'
import { Form } from './Form'

interface SideModalFormProps<Values> extends FormProps<Values> {
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: ReactNode
}

export function SideModalForm<Values>({
  id,
  children,
  onDismiss,
  isOpen,
  submitDisabled,
  error,
  title,
  ...formProps
}: SideModalFormProps<Values>) {
  const childArray = flattenChildren(children)
  const submit = pluckFirstOfType(childArray, Form.Submit)

  return (
    <SideModal id={`${id}-modal`} onDismiss={onDismiss} isOpen={isOpen}>
      {title && <SideModal.Title id={`${id}-title`}>{title}</SideModal.Title>}
      <SideModal.Body>
        <Form id={id} className="is-side-modal" {...formProps}>
          {childArray}
        </Form>
      </SideModal.Body>
      <SideModal.Footer>
        <Form.Actions formId={id} submitDisabled={submitDisabled} error={error}>
          {submit || <Form.Submit>{title}</Form.Submit>}
          <Form.Cancel onClick={onDismiss} />
        </Form.Actions>
      </SideModal.Footer>
    </SideModal>
  )
}
