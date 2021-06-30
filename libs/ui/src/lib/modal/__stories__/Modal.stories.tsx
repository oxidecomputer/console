import React from 'react'
import type { DecoratorFn, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import type { AlertModalProps, ConfirmModalProps } from '../Modal'
import { AlertModal, ConfirmModal } from '../Modal'

export const decorators: DecoratorFn[] = [
  (Story) => (
    <div className="flex absolute top-0 bottom-0 right-0 left-0">{Story()}</div>
  ),
]

const ConfirmTemplate: Story<ConfirmModalProps> = (args) => (
  <ConfirmModal {...args} />
)

export const Default = ConfirmTemplate.bind({})
Default.args = {
  title: 'Update successful',
  icon: 'check',
  children: 'Lorem ipsum ...',
  cancelText: 'Cancel',
  onCancel: action('onCancel'),
  confirmText: 'Activate',
  onConfirm: action('onConfirm'),
}
Default.storyName = 'Confirm'

const AlertTemplate: Story<AlertModalProps> = (args) => <AlertModal {...args} />

export const AlertStory = AlertTemplate.bind({})
AlertStory.args = {
  title: 'Update successful',
  icon: 'check',
  children: 'Lorem ipsum ...',
  confirmText: 'Go back to dashboard',
  onConfirm: action('onConfirm'),
}
AlertStory.storyName = 'Alert'
