import type { FC, ReactElement, ReactNode } from 'react'
import React from 'react'
import styled from 'styled-components'
import Button from '../button/Button'
import Icon from '../icon/Icon'
import type { IconName } from '../icon/icons'
import Text from '../text/Text'

interface ModalContainerProps {
  children: [
    ReactElement<HeaderProps>,
    ReactElement<BodyProps>,
    ReactElement<ActionsProps>
  ]
}
export const ModalContainer = styled.div<ModalContainerProps>``

const StyledHeader = styled.header``
const HeaderIcon = styled.span``
interface HeaderProps {
  icon: IconName
}
export const Header: FC<HeaderProps> = ({ icon, children }) => (
  <StyledHeader>
    <HeaderIcon>
      <Icon name={icon} color="green500" />
    </HeaderIcon>
    <Text>{children}</Text>
  </StyledHeader>
)

interface BodyProps {
  children: ReactNode
}
const StyledBody = styled.main``
export const Body: FC = ({ children }) => <StyledBody>{children}</StyledBody>

const StyledActions = styled.footer``
interface ActionsProps {
  children:
    | ReactElement<ActionProps>
    | [ReactElement<ActionProps>, ReactElement<ActionProps>]
}
export const Actions: FC<ActionsProps> = ({ children }) => (
  <StyledActions>{children}</StyledActions>
)

interface ActionProps {
  primary?: boolean

  onClick: () => void
}

const StyledAction = styled(Button)``
export const Action: FC<ActionProps> = ({ children }) => (
  <StyledAction variant="subtle">{children}</StyledAction>
)
