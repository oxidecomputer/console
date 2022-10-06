/* eslint-disable jsx-a11y/aria-proptypes */
// there seems to be a bug in the linter. it doesn't want you to use the string
// "true" because it insists it's a boolean
import { Disabled12Icon, Success12Icon } from '@oxide/ui'

import type { Cell } from '.'

export const BooleanCell = ({ value }: Cell<boolean>) =>
  value ? (
    <Success12Icon className="mr-1 text-accent" aria-label="true" />
  ) : (
    <Disabled12Icon className="mr-1 text-notice" aria-label="false" />
  )
