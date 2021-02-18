import React from 'react'

import styled, { css } from 'styled-components'
import { Icon, NameType } from '../icon/Icon'

export const sizes = ['xs', 'sm', 'base', 'lg'] as const
export const variants = ['solid', 'outline', 'ghost', 'link'] as const

type Size = typeof sizes[number]
type Variant = typeof variants[number]

export interface ButtonProps {
  /**
   * Display an icon
   */
  icon?: {
    align?: 'left' | 'right'
    name: NameType
    isRounded?: boolean
  }
  /**
   * Set the size of the button
   */
  size: Size
  /**
   * Style variation or button styles
   */
  variant: Variant
  /**
   * Disable button
   */
  disabled?: boolean
}

const getSizeStyles = (size: Size) => {
  switch (size) {
    case 'xs':
      return css`
        font-size: ${({ theme }) => theme.spacing(3)}; /* 0.75rem */
        line-height: ${1 / 0.75}; /* 1rem */
        padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(3)}`};
      `
    case 'sm':
      return css`
        font-size: ${({ theme }) => theme.spacing(3)}; /* 0.75rem */
        line-height: ${1 / 0.75}; /* 1rem */
        padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
      `
    case 'lg':
      return css`
        font-size: 1.125rem; /* theme.spacing(4.5) */
        line-height: ${1.75 / 1.125}; /* 1.75rem */
        padding: ${({ theme }) => `${theme.spacing(3)} ${theme.spacing(6)}`};
      `
    case 'base':
    default:
      return css`
        font-size: 0.875rem; /* theme.spacing(3.5) */
        line-height: ${1.25 / 0.875}; /* 1.25rem */
        padding: ${({ theme }) => `${theme.spacing(2)} ${theme.spacing(3)}`};
      `
  }
}

const getVariantStyles = (variant: Variant) => {
  switch (variant) {
    case 'outline':
      return css`
        background-color: ${({ theme }) => theme.themeColors.white};
        box-shadow: inset 0 0 0 1px ${({ theme }) => theme.themeColors.green500};
        color: ${({ theme }) => theme.themeColors.green500};

        &:hover:not(:disabled):not([disabled]) {
          background-color: ${({ theme }) => theme.themeColors.green50};
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'ghost':
      return css`
        background-color: transparent;
        color: ${({ theme }) => theme.themeColors.green500};

        &:hover:not(:disabled):not([disabled]) {
          background-color: ${({ theme }) => theme.themeColors.green50};
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'link':
      return css`
        padding: 0;
        background-color: transparent;
        color: ${({ theme }) => theme.themeColors.green500};

        &:hover:not(:disabled):not([disabled]) {
          text-decoration: underline;
        }

        &:disabled,
        [disabled] {
          opacity: 0.4;
        }
      `
    case 'solid':
    default:
      return css`
        background-color: ${({ theme }) => theme.themeColors.green500};
        color: ${({ theme }) => theme.themeColors.green50};

        &:hover:not(:disabled):not([disabled]) {
          background-color: ${({ theme }) => theme.themeColors.green600};
        }

        &:disabled,
        [disabled] {
          opacity: 0.64;
        }
      `
  }
}

const StyledIcon = styled(Icon)``

const iconStyles = css`
  > ${StyledIcon} {
  }
`

const roundedStyles = css`
  /* Padding should be a single number */
  border-radius: ${({ theme }) => theme.spacing(64)};
`

const StyledButton = styled.button<
  ButtonProps & { hasIcon?: boolean; isRounded?: boolean }
>`
  align-items: center;
  display: inline-flex;
  flex-direction: row;

  border: none;
  border-radius: 0;
  text-transform: uppercase;

  ${(props) => getSizeStyles(props.size)};
  ${(props) => getVariantStyles(props.variant)};
  ${(props) => props.hasIcon && iconStyles};
  ${(props) => props.isRounded && roundedStyles};
`

export const Button: React.FC<ButtonProps> = ({ children, icon, ...rest }) => {
  if (icon) {
    const { align, isRounded } = icon

    let renderButtonChildren
    if (align === 'right') {
      renderButtonChildren = (
        <React.Fragment>
          {children} <StyledIcon {...icon} />
        </React.Fragment>
      )
    } else {
      renderButtonChildren = (
        <React.Fragment>
          <StyledIcon {...icon} /> {children}
        </React.Fragment>
      )
    }
    return (
      <StyledButton type="button" hasIcon isRounded={isRounded} {...rest}>
        {renderButtonChildren}
      </StyledButton>
    )
  }
  return (
    <StyledButton type="button" {...rest}>
      {children}
    </StyledButton>
  )
}

Button.defaultProps = {
  size: 'base',
  variant: 'solid',
}

export default Button
