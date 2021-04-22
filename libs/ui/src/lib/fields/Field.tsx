import React, { useMemo } from 'react'
import type { FC, ReactNode, ReactFragment } from 'react'
import type { StyledComponentProps } from 'styled-components'
import styled, { css } from 'styled-components'
import Text from '../text/Text'
import type { Theme } from '@oxide/theme'
import { Tooltip } from '../tooltip/Tooltip'
import Icon from '../icon/Icon'

export interface FieldProps {
  /**
   * ID of the form field this field represents
   */
  id: string
  /**
   * Is this field disabled?
   */
  disabled?: boolean
  /**
   * Is the field required in the form.
   */
  required?: boolean
  /**
   * Label for this field.
   */
  label: string | ReactFragment
  /**
   * Error message text to render, if truthy, marks the field as invalid
   */
  error?: string
  /**
   * Additional text to associate with this specific field, used to indicate what the field is used for
   */
  hint?: ReactNode
  /**
   * Additional text to show in a popover inside the text field, this content should not be requried to understand the use of the field
   */
  info?: ReactNode

  children: ReactNode
}

const Container = styled.div<Pick<FieldProps, 'disabled'>>`
  color: ${({ theme }) => theme.color('gray100')};

  ${({ disabled }) =>
    disabled &&
    css`
      opacity: 0.4;
    `}
`

/* LABEL */

const LabelContainer = styled.label`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;

  padding-bottom: ${({ theme }) => theme.spacing(1)};
`

const LabelText = styled(Text)`
  flex: 1;

  display: flex;
  align-items: center;
`

type LabelProps = StyledComponentProps<
  'label',
  Theme,
  Pick<FieldProps, 'required'>,
  never
>
const Label: FC<LabelProps> = ({ required, children, ...labelProps }) => (
  <LabelContainer {...labelProps}>
    <LabelText weight={500}>{children}</LabelText>
    {!required && <Text size="sm">Optional</Text>}
  </LabelContainer>
)

/* HINT */

const HintContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};

  color: ${({ theme }) => theme.color('gray300')};
`

const Hint: FC<{ id: string }> = ({ id, children }) => (
  <HintContainer id={id}>
    <Text size="sm" weight={500}>
      {children}
    </Text>
  </HintContainer>
)

/* INPUT CONTAINER */

const InputContainer = styled.div<Pick<FieldProps, 'error'>>`
  display: flex;
  flex-direction: row;

  background-color: ${({ theme }) => theme.color('gray700')};
  border: 1px solid transparent;

  :focus-within {
    border-color: ${({ theme, error }) =>
      theme.color(error ? 'red500' : 'green500')};
    ${({ theme, error }) =>
      error
        ? css`
            box-shadow: 0px 1px 2px ${theme.color('black', 0.05)},
              0px 0px 0px 1px #ef4444;
          `
        : css`
            box-shadow: 0px 0px 0px 1px ${theme.color('green500')};
          `}
  }

  > input {
    flex: 1;
  }
`

/* ERROR */

const ErrorContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`
const ErrorMessage: FC<{ id: string }> = ({ id, children }) => (
  <ErrorContainer id={id}>
    <Text size="xs">{children}</Text>
  </ErrorContainer>
)

/* INFO */

const IconContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(0, 2.25)};
  font-size: ${({ theme }) => theme.spacing(5)};
`
const InfoPopover: FC = ({ children }) => (
  <Tooltip isPrimaryLabel={false} content={children}>
    <IconContainer>
      <Icon name="infoFilled" color="gray300" />
    </IconContainer>
  </Tooltip>
)

/* FIELD */

export const Field: FC<FieldProps> = ({
  id: id,
  required,
  error,
  hint,
  label,
  info,
  children,
}) => {
  const errorId = useMemo(() => (error ? `${id}-validation-hint` : ''), [
    error,
    id,
  ])
  const hintId = useMemo(() => (hint ? `${id}-hint` : ''), [hint, id])

  return (
    <Container>
      <Label required={required} htmlFor={id}>
        {label}
      </Label>
      {hint && <Hint id={hintId}>{hint}</Hint>}
      <InputContainer error={error}>
        {children}
        {info && <InfoPopover>{info}</InfoPopover>}
      </InputContainer>
      {error && <ErrorMessage id={errorId}>{error}</ErrorMessage>}
    </Container>
  )
}
