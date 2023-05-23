import type { ReactElement, ReactNode } from 'react'
import { cloneElement, useEffect } from 'react'
import type { FieldValues, UseFormProps, UseFormReturn } from 'react-hook-form'
import { useForm } from 'react-hook-form'
import type { unstable_Blocker as Blocker } from 'react-router-dom'
import { unstable_useBlocker as useBlocker } from 'react-router-dom'

import type { ApiError } from '@oxide/api'
import { Modal, PageHeader, PageTitle } from '@oxide/ui'
import { classed, flattenChildren, pluckFirstOfType } from '@oxide/util'

import { PageActions } from '../PageActions'
import { Form } from '../form/Form'

interface FullPageFormProps<TFieldValues extends FieldValues> {
  id: string
  title: string
  icon: ReactElement
  /** Must provide a reason for submit being disabled */
  submitDisabled?: string
  error?: Error
  formOptions: UseFormProps<TFieldValues>
  loading?: boolean
  onSubmit: (values: TFieldValues) => void
  /** Error from the API call */
  submitError: ApiError | null
  /**
   * A function that returns the fields.
   *
   * Implemented as a function so we can pass `control` to the fields in the
   * calling code. We could do that internally with `cloneElement` instead, but
   * then in the calling code, the field would not infer `TFieldValues` and
   * constrain the `name` prop to paths in the values object.
   */
  children: (form: UseFormReturn<TFieldValues>) => ReactNode
}

const PageActionsContainer = classed.div`flex h-20 items-center gutter`

export function FullPageForm<TFieldValues extends FieldValues>({
  id,
  title,
  children,
  submitDisabled,
  error,
  icon,
  loading,
  formOptions,
  onSubmit,
  submitError,
}: FullPageFormProps<TFieldValues>) {
  const form = useForm(formOptions)
  const { isSubmitting, isDirty } = form.formState

  const blocker = useBlocker(isDirty)

  // Reset blocker if form is no longer dirty
  useEffect(() => {
    if (blocker.state === 'blocked' && !isDirty) {
      blocker.reset()
    }
  }, [blocker, isDirty])

  const childArray = flattenChildren(children(form))
  const actions = pluckFirstOfType(childArray, Form.Actions)

  return (
    <>
      <PageHeader>
        <PageTitle icon={icon}>{title}</PageTitle>
      </PageHeader>
      <form
        className="ox-form pb-20"
        id={id}
        onSubmit={(e) => {
          // This modal being in a portal doesn't prevent the submit event
          // from bubbling up out of the portal. Normally that's not a
          // problem, but sometimes (e.g., instance create) we render the
          // SideModalForm from inside another form, in which case submitting
          // the inner form submits the outer form unless we stop propagation
          e.stopPropagation()
          form.reset({}, { keepValues: true })
          form.handleSubmit(onSubmit)(e)
        }}
        autoComplete="off"
      >
        {childArray}
      </form>

      {blocker ? <ConfirmNavigation blocker={blocker} /> : null}

      {actions && (
        <PageActions>
          <PageActionsContainer>
            {cloneElement(actions, {
              formId: id,
              submitDisabled,
              loading: loading || isSubmitting,
              error: error || submitError,
            })}
          </PageActionsContainer>
        </PageActions>
      )}
    </>
  )
}

const ConfirmNavigation = ({ blocker }: { blocker: Blocker }) => (
  <Modal isOpen={blocker.state === 'blocked'} onDismiss={() => blocker.reset?.()}>
    <Modal.Title>Confirm Navigation</Modal.Title>

    <Modal.Section>
      Are you sure you want to leave this page? <br /> You will lose all progress on this
      form.
    </Modal.Section>
    <Modal.Footer
      onDismiss={() => blocker.reset?.()}
      onAction={() => blocker.proceed?.()}
      cancelText="Continue editing"
      actionText="Leave this page"
      actionType="danger"
    />
  </Modal>
)
