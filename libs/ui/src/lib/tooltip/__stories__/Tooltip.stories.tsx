import React from 'react'
import { Tooltip, TooltipProps } from '../Tooltip'

export default {
  component: Tooltip,
  title: 'Tooltip',
}

export const primary = () => {
  /* eslint-disable-next-line */
  const props: TooltipProps = {}

  return <Tooltip />
}
