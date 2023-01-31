import { useState } from 'react'

import type { Cell } from './Cell'

export const useIdExpandToggle = () => {
  const [idExpanded, setIdExpanded] = useState(false)

  return [idExpanded, () => setIdExpanded(!idExpanded)] as const
}

export const idCell =
  (expanded: boolean, toggleExpand: () => void) =>
  ({ value }: Cell<string>) => {
    return expanded ? (
      <span className="text-secondary">{value}</span>
    ) : (
      <>
        <span className="mr-0.5 text-secondary">{value.split('-')[0]}</span>
        <button className="text-accent-secondary" onClick={toggleExpand}>
          ...
        </button>
      </>
    )
  }
