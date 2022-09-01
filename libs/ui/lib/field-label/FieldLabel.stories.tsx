import { FieldLabel } from './FieldLabel'

export const Default = () => <FieldLabel id="hi">hello world</FieldLabel>

export const WithTip = () => (
  <FieldLabel
    id="hi"
    tip="This is often used as the greeting from a new programming language"
  >
    hello world
  </FieldLabel>
)

export const AsLegend = () => (
  <FieldLabel id="hi" tip="This component is literally a <legend> element" as="legend">
    I am legend
  </FieldLabel>
)
