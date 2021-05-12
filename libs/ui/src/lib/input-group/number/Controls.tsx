import { color, spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'
import { styled } from 'twin.macro'
import { Icon } from '../../icon/Icon'

const FieldControls = styled.div`
  display: flex;
  flex-direction: row;
`

const Control = styled.button`
  flex: 0 0 auto;
  padding: ${spacing(2, 3)};

  &:focus {
    outline: none;
    border-color: ${color('green500')};
    box-shadow: inset 0 0 0 1px ${color('green500')};
  }

  &:not(:disabled):hover {
    background-color: ${color('gray800')};
  }
`

export interface ControlsProps {
  /** Fires when the plus button is clicked */
  onIncrement: () => void
  /** Fires when the minus button is clicked */
  onDecrement: () => void

  /** Should buttons be disabled */
  disabled?: boolean

  /** This component should have no children */
  children?: never
}

export const Controls: FC<ControlsProps> = ({
  onDecrement,
  onIncrement,
  disabled,
}: ControlsProps) => (
  <FieldControls>
    <Control
      onClick={() => {
        onDecrement()
      }}
      disabled={disabled}
    >
      <Icon name="minus" svgProps={{ title: 'Decrement' }} />
    </Control>
    <Control
      onClick={() => {
        onIncrement()
      }}
      disabled={disabled}
    >
      <Icon name="plus" svgProps={{ title: 'Increment' }} />
    </Control>
  </FieldControls>
)
