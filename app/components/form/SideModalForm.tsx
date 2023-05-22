import type { ReactNode } from 'react'
import { useEffect } from 'react'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import { useNavigationType } from 'react-router-dom'

import type { ErrorResult } from '@oxide/api'
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

/**
 * Only animate the modal in when we're navigating by a client-side click.
 * Don't animate on a fresh pageload or on back/forward. The latter may be
 * slightly awkward but it also makes some sense. I do not believe there is
 * any way to distinguish between fresh pageload and back/forward.
 */
export function useShouldAnimateModal() {
  return useNavigationType() === 'PUSH'
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

  const { isSubmitting } = form.formState

  /**
   * Only animate the modal in when we're navigating by a client-side click.
   * Don't animate on a fresh pageload or on back/forward. The latter may be
   * slightly awkward but it also makes some sense. I do not believe there is
   * any way to distinguish between fresh pageload and back/forward.
   */
  const animate = useNavigationType() === 'PUSH'

  useEffect(() => {
    if (
      submitError?.error &&
      ('errorCode' in submitError.error || 'name' in submitError.error)
    ) {
      const nameOrErrorCode =
        'errorCode' in submitError.error
          ? submitError.error.errorCode
          : (submitError.error as Error).name

      // Check if there is a 'name' field in the form
      // If there is we set an error on it when it
      // already exists
      if (nameOrErrorCode === 'ObjectAlreadyExists' && 'name' in form.getValues()) {
        // @ts-ignore
        form.setError('name', { message: 'Name already exists' })
      }
    }
  }, [submitError, form])

  return (
    <SideModal
      onDismiss={onDismiss}
      isOpen
      title={title}
      animate={animate}
      errors={
        submitError?.error && 'message' in submitError.error
          ? [submitError.error.message]
          : []
      }
    >
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
      <SideModal.Footer
        error={submitError?.error && 'message' in submitError.error ? true : false}
      >
        <Button variant="ghost" size="sm" onClick={onDismiss}>
          Cancel
        </Button>
        <Button
          type="submit"
          size="sm"
          disabled={!!submitDisabled}
          disabledReason={submitDisabled}
          loading={loading || isSubmitting}
          form={id}
        >
          {submitLabel || title}
        </Button>
      </SideModal.Footer>
    </SideModal>
  )
}
