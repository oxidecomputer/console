import React from 'react'
import type { Meta, Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import { Modal, Header, Body, Actions, Action } from '../Modal'
import type { IconName } from '../../icon/icons'
import { icons } from '../../icon/icons'

export default {
  title: 'Components/Modal',
  argTypes: {
    icon: {
      control: {
        type: 'select',
        options: Object.keys(icons),
      },
    },
  },
} as Meta<ModalStoryProps>

interface ModalStoryProps {
  title: string
  body: string
  icon: IconName
  onCancel: () => void
  onActivate: () => void
}

const Template: Story<ModalStoryProps> = ({
  title,
  icon,
  body,
  onCancel,
  onActivate,
}) => (
  <Modal>
    <Header icon={icon}>{title}</Header>
    <Body>{body}</Body>
    <Actions>
      <Action onClick={onCancel}>Cancel</Action>
      <Action onClick={onActivate} primary>
        Activate
      </Action>
    </Actions>
  </Modal>
)

export const Default = Template.bind({})
Default.args = {
  title: 'Update successful',
  icon: 'check',
  body: 'Lorem ipsum ...',
  onCancel: action('onCancel'),
  onActivate: action('onActivate'),
}
Default.storyName = 'Two Button Modal'
