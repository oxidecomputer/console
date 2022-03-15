import { SideModal } from './SideModal'
import type { StoryObj } from '@storybook/react'
import type { ComponentProps } from 'react'
import React from 'react'
import { Button } from '../button/Button'

type Story = StoryObj<ComponentProps<typeof SideModal>>

export const Default: Story = {
  args: {
    title: 'Test SideModal',
    children: (
      <>
        <SideModal.Section>Section content</SideModal.Section>
        <SideModal.Docs>
          <a href="#/">Subnetworks</a>
          <a href="#/">External IPs</a>
        </SideModal.Docs>
        <SideModal.Footer>
          <Button>Ok</Button>
        </SideModal.Footer>
      </>
    ),
  },
}
