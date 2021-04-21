import type { Meta, Story } from '@storybook/react'
import React from 'react'
import styled from 'styled-components'
import type { FieldProps } from '../'
import { Field, Input } from '../'
import Icon from '../../icon/Icon'

export default {
  title: 'Components/Fields/Custom Fields',
} as Meta<FieldProps>

const IconContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(0, 2)};
  align-self: center;
`

const Template: Story<FieldProps> = (args) => (
  <Field {...args}>
    <IconContainer>
      <Icon name="info" color="gray300" />
    </IconContainer>
    <Input />
  </Field>
)
export const Default = Template.bind({})
Default.args = {
  label: 'Custom Field',
  required: false,
  hint: '',
  error: false,
  errorMessage: '',
}
