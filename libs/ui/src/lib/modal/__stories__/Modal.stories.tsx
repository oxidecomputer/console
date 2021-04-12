import React from 'react'
import type { Story } from '@storybook/react'
import type { ModalProps } from '../Modal'
import { Modal } from '../Modal'

const Template: Story<ModalProps> = (args) => <Modal {...args} />

export const Default = Template.bind({})
Default.args = {}
