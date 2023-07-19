/*
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, you can obtain one at https://mozilla.org/MPL/2.0/.
 *
 * Copyright Oxide Computer Company
 */
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Clipboard12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/clipboard">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4.67 0C4.29997 0 4 0.299969 4 0.67V0.999996V1.33C4 1.33 4 1.33 4 1.33C4 1.43554 4.0244 1.53538 4.06787 1.62418C4.17681 1.84674 4.40551 2 4.67 2H7.33C7.51502 2 7.68252 1.92501 7.80376 1.80376C7.92501 1.68252 8 1.51502 8 1.33C8 1.33 8 1.33 8 1.33V0.999996V0.67C8 0.299969 7.70003 0 7.33 0H4.67ZM1.67 0.999996H2.5V1.33C2.5 2.52845 3.47154 3.5 4.67 3.5H7.33C8.52846 3.5 9.5 2.52845 9.5 1.33V0.999996H10.33C10.7 0.999996 11 1.29996 11 1.67V11.33C11 11.7 10.7 12 10.33 12H1.67C1.29997 12 1 11.7 1 11.33V1.67C1 1.29996 1.29997 0.999996 1.67 0.999996Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Clipboard12Icon
