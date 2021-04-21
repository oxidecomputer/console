import type { FC } from 'react'
import React from 'react'
import styled from 'styled-components'
import Icon from '../../icon/Icon'

const FieldControls = styled.div`
  display: flex;
  flex-direction: row;
`

const Control = styled.button`
  flex: 0 0 auto;
  padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color('green500')};
    box-shadow: inset 0 0 0 1px ${({ theme }) => theme.color('green500')};
  }

  &:hover {
    background-color: ${({ theme }) => theme.color('gray800')};
  }
`

export interface ControlsProps {
  /** Fires when the plus button is clicked */
  onIncrement: () => void
  /** Fires when the minus button is clicked */
  onDecrement: () => void

  /** This component should have no children */
  children?: never
}

export const Controls: FC<ControlsProps> = ({
  onDecrement,
  onIncrement,
}: ControlsProps) => (
  <FieldControls>
    <Control
      onClick={() => {
        onDecrement()
      }}
    >
      <Icon name="minus" svgProps={{ title: 'Decrement' }} />
    </Control>
    <Control
      onClick={() => {
        onIncrement()
      }}
    >
      <Icon name="plus" svgProps={{ title: 'Increment' }} />
    </Control>
  </FieldControls>
)
