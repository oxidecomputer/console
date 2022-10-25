import cn from 'classnames'
import type { FormikConfig } from 'formik'
import { Formik, Form as FormikForm } from 'formik'
import { useFormikContext } from 'formik'
import type { ReactNode } from 'react'
import { cloneElement } from 'react'
import { useEffect } from 'react'
import invariant from 'tiny-invariant'

import type { ButtonProps } from '@oxide/ui'
import { Error12Icon } from '@oxide/ui'
import { Button } from '@oxide/ui'
import { addProps, classed, flattenChildren, isOneOf, pluckFirstOfType } from '@oxide/util'

import './form.css'

export interface FormProps<Values> extends FormikConfig<Values> {
  id: string
  className?: string
  children: ReactNode
  /** true if submission can happen, false otherwise */
  setSubmitState?: (state: boolean) => void
}

export function Form<Values extends Record<string, unknown>>({
  id,
  children,
  className,
  setSubmitState,
  ...formikProps
}: FormProps<Values>) {
  // Coerce container so it can be used in wrap
  return (
    <Formik {...formikProps} validateOnBlur={false} isInitialValid={false}>
      <FormikForm id={id} className={cn('ox-form', className)} autoComplete="off">
        {children}
        <FormSubmitState setSubmitState={setSubmitState} />
      </FormikForm>
    </Formik>
  )
}

/**
 * This annoying little component exists solely to inform the parent when the submit state changes.
 */
const FormSubmitState = ({
  setSubmitState,
}: {
  setSubmitState?: (state: boolean) => void
}) => {
  const context = useFormikContext()
  useEffect(() => {
    if (setSubmitState) {
      setSubmitState(context.dirty && context.isValid)
    }
  }, [context.dirty, context.isValid, setSubmitState])
  return null
}

interface FormActionsProps {
  formId?: string
  children: React.ReactNode
  submitDisabled?: boolean
  error?: Error | null
  className?: string
}

/**
 * This component is the area at the bottom of a form that contains
 * the submit button and any other actions. The first button is automatically
 * given a type of "submit." Default styles are applied all buttons but can be
 * overridden.
 */
Form.Actions = ({
  children,
  formId,
  submitDisabled = true,
  error,
  className,
}: FormActionsProps) => {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const childArray = flattenChildren(children).map(
    addProps<typeof Button>((i, props) => ({
      size: 'sm',
      ...props,
    }))
  )

  invariant(
    isOneOf(childArray, [Form.Submit, Form.Cancel, Button]),
    'Form.Actions should only receive Button components as children'
  )

  const submit = pluckFirstOfType(childArray, Form.Submit)

  invariant(submit, 'Form.Actions must contain a Form.Submit component')

  return (
    <div
      className={cn('flex w-full items-center gap-[0.625rem] children:shrink-0', className)}
    >
      {cloneElement(submit, { form: formId, disabled: submitDisabled })}
      {childArray}
      {error && (
        <div className="flex !shrink grow items-start justify-end text-mono-sm text-error">
          <Error12Icon className="mx-2 mt-0.5 shrink-0" />
          <span>{error.message}</span>
        </div>
      )}
    </div>
  )
}

Form.Submit = (props: ButtonProps) => <Button type="submit" variant="default" {...props} />

Form.Cancel = (props: ButtonProps) => (
  <Button variant="ghost" color="secondary" {...props}>
    Cancel
  </Button>
)

Form.Heading = classed.h2`text-content text-sans-light-2xl`
