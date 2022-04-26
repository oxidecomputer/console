import type { Cell, TypeValue } from '.'
import { TypeValueCell } from '.'

export const TypeValueListCell = ({ value }: Cell<TypeValue[]>) => (
  <div>
    {value.map((v, i) => (
      <TypeValueCell key={i} value={v} />
    ))}
  </div>
)
