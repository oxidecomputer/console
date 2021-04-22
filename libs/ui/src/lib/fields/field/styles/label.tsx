import type { Theme } from '@oxide/theme'
import type { FC } from 'react'
import React from 'react'
import type { StyledComponentProps } from 'styled-components'
import styled from 'styled-components'
import Text from '../../../text/Text'
import type { FieldProps } from '../types'

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
export const Label: FC<LabelProps> = ({
  required,
  children,
  ...labelProps
}) => (
  <LabelContainer {...labelProps}>
    <LabelText weight={500}>{children}</LabelText>
    {!required && <Text size="sm">Optional</Text>}
  </LabelContainer>
)
