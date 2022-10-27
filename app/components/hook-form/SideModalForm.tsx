import type { ReactNode } from 'react'
import type { Control, FieldValues, UseFormProps } from 'react-hook-form'
import { useForm } from 'react-hook-form'

import { Error12Icon } from '@oxide/ui'
import { Button, SideModal } from '@oxide/ui'

type SideModalFormProps<TFieldValues extends FieldValues> = {
  id: string
  formOptions: UseFormProps<TFieldValues>
  /**
   * A function that returns the fields.
   *
   * Implemented as a function so we can pass `control` to the fields in the
   * calling code. We could do that internally with `cloneElement` instead, but
   * then in the calling code, the field would not infer `TFieldValues` and
   * constrain the `name` prop to paths in the values object.
   */
  children: (control: Control<TFieldValues>) => ReactNode
  isOpen: boolean
  onDismiss: () => void
  submitDisabled?: boolean
  error?: Error
  title: string
  onSubmit: (values: TFieldValues) => void
  submitLabel?: string
}

export function SideModalForm<TFieldValues extends FieldValues>({
  id,
  formOptions,
  children,
  onDismiss,
  isOpen,
  submitDisabled = false,
  error,
  title,
  onSubmit,
  submitLabel,
}: SideModalFormProps<TFieldValues>) {
  // TODO: RHF docs warn about the performance impact of validating on every
  // change
  const {
    control,
    formState: { isDirty, isValid },
    handleSubmit,
  } = useForm({ mode: 'all', ...formOptions })

  const canSubmit = isDirty && isValid

  return (
    <SideModal onDismiss={onDismiss} isOpen={isOpen} title={title}>
      <SideModal.Body>
        <form
          id={id}
          className="ox-form is-side-modal"
          autoComplete="off"
          onSubmit={handleSubmit(onSubmit)}
        >
          {children(control)}
        </form>
      </SideModal.Body>
      <SideModal.Footer>
        <div className="flex w-full items-center gap-[0.625rem] children:shrink-0">
          <Button variant="ghost" color="secondary" size="sm" onClick={onDismiss}>
            Cancel
          </Button>
          <Button type="submit" size="sm" disabled={submitDisabled || !canSubmit} form={id}>
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
