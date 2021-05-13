import type { FC, ReactElement, ReactNode } from 'react'
import { useEffect, useRef } from 'react'
import React from 'react'
import tw, { styled } from 'twin.macro'
import { Button } from '../button/Button'
import { Icon } from '../icon/Icon'
import type { IconName } from '../icon/icons'
import { breakpoint, color, spacing } from '@oxide/css-helpers'

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
    background: ${color('black')};

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

  padding: ${spacing(6, 6, 0, 6)};

  ${tw`space-y-4`}
`
const IconContainer = styled.span`
  flex: 0 0 auto;
`
const HeaderIcon = styled.span`
  display: inline-block;
  width: ${spacing(12)};
  height: ${spacing(12)};
  background-color: ${color('green900')};
  border-radius: 9999px;
`
const StyledIcon = styled(Icon)`
  font-size: ${spacing(12)};
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
    <span tw="text-green-400">{children}</span>
  </StyledHeader>
)

interface BodyProps {
  children: ReactNode
}

export const Body: FC = ({ children }) => (
  <main tw="text-sm flex-auto p-6 pt-4">{children}</main>
)

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
