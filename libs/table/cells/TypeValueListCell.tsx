import React from 'react'
import type { Cell } from '.'
import { TypeValueCell } from '.'

export const TypeValueListCell = ({
  value,
}: Cell<Array<{ type: string; value: string }>>) => (
  <div>
    {value.map((v, i) => (
      <TypeValueCell key={i} value={v} />
    ))}
  </div>
)
