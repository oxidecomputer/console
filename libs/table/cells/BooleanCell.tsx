import { Disabled12Icon, Success12Icon } from '@oxide/ui'

import type { Cell } from '.'

export const BooleanCell = ({ value }: Cell<boolean>) =>
  value ? (
    <>
      <Success12Icon className="mr-1 text-accent" />
    </>
  ) : (
    <>
      <Disabled12Icon className="mr-1 text-notice" />
    </>
  )
