import { flattenChildren } from '@oxide/util'
import type { FormikProps } from 'formik'
import { Formik, Form as FormikForm } from 'formik'
import type { ReactNode } from 'react'
import React from 'react'

interface FormProps<Values> extends Omit<FormikProps<Values>, 'initialValues'> {
  children: ReactNode
}

export function Form<Value>({ children }: FormProps<Value>) {
  const fields = flattenChildren(children).filter((value) => {
    return 'name' in component.props && 'initialValue' in component.type
  })
  return (
    <Formik
      initialValues={undefined}
      onSubmit={function (
        values: FormikValues,
        formikHelpers: FormikHelpers<FormikValues>
      ): void | Promise<any> {
        throw new Error('Function not implemented.')
      }}
    >
      <FormikForm></FormikForm>
    </Formik>
  )
}
