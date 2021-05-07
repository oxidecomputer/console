import { spacing } from '@oxide/css-helpers'
import type { FC } from 'react'
import React from 'react'
import type { StyledComponentProps } from 'styled-components'
import { styled } from 'twin.macro'
import Text from '../../../text/Text'
import type { InputGroupProps } from '../types'

const LabelContainer = styled.label`
  flex: 0 0 auto;

  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: baseline;

  padding-bottom: ${spacing(1)};
`

const LabelText = styled(Text)`
  flex: 1;

  display: flex;
  align-items: center;
`

type LabelProps = StyledComponentProps<
  'label',
  never,
  Pick<InputGroupProps, 'required'>,
  never
>
export const Label: FC<LabelProps> = ({
  required,
  children,
  ...labelProps
}) => (
  <LabelContainer {...labelProps}>
    <LabelText weight={500} size="base">
      {children}
    </LabelText>
    {!required && <Text size="sm">Optional</Text>}
  </LabelContainer>
)
