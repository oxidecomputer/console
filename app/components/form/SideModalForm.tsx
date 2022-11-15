import type { ReactNode } from 'react'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useNavigationType } from 'react-router-dom'

import type { ErrorResult } from '@oxide/api'
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
  children: (form: UseFormReturn<TFieldValues>) => ReactNode
  onDismiss: () => void
  /** Must be provided with a reason describing why it's disabled */
  submitDisabled?: string
  /** Error from the API call */
  submitError: ErrorResult | null
  loading?: boolean
  title: string
  onSubmit: (values: TFieldValues) => void
  submitLabel?: string
}

export function SideModalForm<TFieldValues extends FieldValues>({
  id,
  formOptions,
  children,
  onDismiss,
  submitDisabled,
  submitError,
  title,
  onSubmit,
  submitLabel,
  loading,
}: SideModalFormProps<TFieldValues>) {
  // TODO: RHF docs warn about the performance impact of validating on every
  // change
  const form = useForm({ mode: 'all', ...formOptions })

  const { isSubmitting, isSubmitSuccessful } = form.formState

  /**
   * Only animate the modal in when we're navigating by a client-side click.
   * Don't animate on a fresh pageload or on back/forward. The latter may be
   * slightly awkward but it also makes some sense. I do not believe there is
   * any way to distinguish between fresh pageload and back/forward.
   */
  const animate = useNavigationType() === 'PUSH'

  return (
    <SideModal onDismiss={onDismiss} isOpen title={title} animate={animate}>
      <SideModal.Body>
        <form
          id={id}
          className="ox-form is-side-modal"
          autoComplete="off"
          onSubmit={(e) => {
            // This modal being in a portal doesn't prevent the submit event
            // from bubbling up out of the portal. Normally that's not a
            // problem, but sometimes (e.g., instance create) we render the
            // SideModalForm from inside another form, in which case submitting
            // the inner form submits the outer form unless we stop propagation
            e.stopPropagation()
            form.handleSubmit(onSubmit)(e)
          }}
        >
          {children(form)}
        </form>
      </SideModal.Body>
      <SideModal.Footer>
        <div className="flex w-full items-center justify-end gap-[0.625rem] children:shrink-0">
          {/* TODO: Better error component here */}
          {submitError?.error && 'message' in submitError.error && (
            <div className="flex grow items-start text-mono-sm text-error">
              <Error12Icon className="mx-2 mt-0.5 shrink-0" />
              <span>{submitError.error.message}</span>
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={onDismiss}>
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={!!submitDisabled}
            disabledReason={submitDisabled}
            loading={loading || isSubmitting || isSubmitSuccessful}
            form={id}
          >
            {submitLabel || title}
          </Button>
        </div>
      </SideModal.Footer>
    </SideModal>
  )
}
