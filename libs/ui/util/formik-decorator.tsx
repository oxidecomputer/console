/* Helper for reducing boilerplate in stories for Formik-based components.
 *
 * Usage in MDX:
 *
 *   <Story decorators={[FormikDecorator()]} /> for one story
 *   <Meta  decorators={[FormikDecorator()]} /> for all stories for that component
 *
 * Usage in CSF:
 *
 *   StoryComponent.decorators = [FormikDecorator()]
 *
 * Pass an argument to set initialValues: FormikDecorator({ name: 'Neo' })
 */

import React from 'react'
import type { Story } from '@storybook/react'
import { Formik, Form } from 'formik'

export const FormikDecorator =
  (initialValues = {}) =>
  (Story: Story) =>
    (
      <Formik initialValues={initialValues} onSubmit={() => {}}>
        <Form>
          <Story />
        </Form>
      </Formik>
    )
