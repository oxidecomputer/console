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
 * Pass an argument to set initialValues: FormikDecorator({ name: 'Neo' }). If
 * you want to pass other props to Formik, just use <Formik> directly in the
 * story definition
 */

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
