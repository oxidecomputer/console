import type { FC, ReactElement, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import React from 'react'
import styled from 'styled-components'
import Button from '../button/Button'
import Icon from '../icon/Icon'
import type { IconName } from '../icon/icons'
import Text from '../text/Text'
import { breakpoint } from '@oxide/css-helpers'

interface ModalContainerProps {
  /**
   * Determines the width of the screen for the modal to take, should be a value between 0 and 1.
   */
  widthPercentage: number

  children: [
    ReactElement<HeaderProps>,
    ReactElement<BodyProps>,
    ReactElement<ActionsProps>
  ]
}

export const Container = styled.div<ModalContainerProps>`
  display: flex;
  flex-direction: column;

  width: 100%;

  ${breakpoint('sm')`
    flex: 0 0 auto;
    align-self: center;
    margin: 0 auto;
    background: ${({ theme }) => theme.color('black')};

    width: 50vw;
  `};

  ${({ widthPercentage }) => breakpoint('lg')`
    width: calc(100vw * ${widthPercentage}); 
  `}
`

const StyledHeader = styled.header`
  flex: 0 0 auto;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  padding: ${({ theme }) => theme.spacing(6, 6, 0, 6)};
  ${({ theme }) => theme.spaceBetweenY(4)}
`
const IconContainer = styled.span`
  flex: 0 0 auto;
`
const HeaderIcon = styled.span`
  display: inline-block;
  width: ${({ theme }) => theme.spacing(12)};
  height: ${({ theme }) => theme.spacing(12)};
  background-color: ${({ theme }) => theme.color('green900')};
  border-radius: 9999px;
`
const StyledIcon = styled(Icon)`
  font-size: ${({ theme }) => theme.spacing(12)};
`
interface HeaderProps {
  icon?: IconName
}
export const Header: FC<HeaderProps> = ({ icon, children }) => (
  <StyledHeader>
    {icon && (
      <IconContainer>
        <HeaderIcon>
          <StyledIcon name={icon} color="green500" />
        </HeaderIcon>
      </IconContainer>
    )}
    <Text color="green400">{children}</Text>
  </StyledHeader>
)

interface BodyProps {
  children: ReactNode
}
const StyledBody = styled(Text).attrs({ as: 'main', size: 'sm' })`
  flex: 1;

  padding: ${({ theme }) => theme.spacing(4, 6, 6, 6)};

  ${breakpoint('sm')`
    flex: 0 0 auto; 
  `}
`
export const Body: FC = ({ children }) => <StyledBody>{children}</StyledBody>

const StyledActions = styled.footer`
  display: flex;
  flex-direction: row;
`
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

const StyledAction = styled(Button)`
  flex: 1;
`
export const Action: FC<ActionProps> = ({ primary, children, onClick }) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  useEffect(() => {
    if (!primary) return

    buttonRef.current?.focus()
  }, [primary])

  return (
    <StyledAction
      variant={primary ? 'solid' : 'subtle'}
      onClick={() => onClick()}
      ref={buttonRef}
    >
      {children}
    </StyledAction>
  )
}
