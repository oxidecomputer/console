import React from 'react'
import type { Story } from '@storybook/react'
import { action } from '@storybook/addon-actions'
import {
  OneButtonModal,
  TwoButtonModal,
  Header,
  Body,
  Actions,
  Action,
} from '../Modal'
import type { IconName } from '../../icon/icons'

interface ModalStoryProps {
  title: string
  body: string
  icon: IconName
}

interface TwoButtonStoryProps extends ModalStoryProps {
  onCancel: () => void
  onActivate: () => void
}

const TwoButtonTemplate: Story<TwoButtonStoryProps> = ({
  title,
  icon,
  body,
  onCancel,
  onActivate,
}) => (
  <TwoButtonModal>
    <Header icon={icon}>{title}</Header>
    <Body>{body}</Body>
    <Actions>
      <Action onClick={onCancel}>Cancel</Action>
      <Action onClick={onActivate} primary>
        Activate
      </Action>
    </Actions>
  </TwoButtonModal>
)

export const Default = TwoButtonTemplate.bind({})
Default.args = {
  title: 'Update successful',
  icon: 'check',
  body: 'Lorem ipsum ...',
  onCancel: action('onCancel'),
  onActivate: action('onActivate'),
}
Default.storyName = 'Two Button Modal'

interface OneButtonStory extends ModalStoryProps {
  onGoToDashboard: () => void
}

const OneButtonTemplate: Story<OneButtonStory> = ({
  title,
  icon,
  body,
  onGoToDashboard,
}) => (
  <OneButtonModal>
    <Header icon={icon}>{title}</Header>
    <Body>{body}</Body>
    <Actions>
      <Action onClick={onGoToDashboard} primary>
        Go back to dashboard
      </Action>
    </Actions>
  </OneButtonModal>
)
export const OneButtonModalStory = OneButtonTemplate.bind({})
OneButtonModalStory.args = {
  title: 'Update successful',
  icon: 'check',
  body: 'Lorem ipsum ...',
  onGoToDashboard: action('onGoToDashboard'),
}
OneButtonModalStory.storyName = 'One Button Modal'
