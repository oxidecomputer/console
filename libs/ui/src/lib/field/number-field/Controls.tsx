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
  onIncrement: () => void
  onDecrement: () => void
}

// Not using React.FC here to avoid the addition of `children`
export const Controls = ({ onDecrement, onIncrement }: ControlsProps) => (
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
