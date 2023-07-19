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
const Access16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/access">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5 13.2897C3.12027 12.1216 2 10.0884 2 7.93636V3.54057C2 3.21775 2.20657 2.93114 2.51283 2.82906L7.76283 1.07906L7.76315 1.07895C7.91689 1.0277 8.08343 1.02781 8.23717 1.07906L13.4872 2.82906L13.4875 2.82916C13.7936 2.93119 14 3.21795 14 3.54057V7.93636C14 10.0884 12.8797 12.0622 11 13.2837C10.9343 13.3264 10.8676 13.3682 10.8 13.4091L8.37051 14.7895C8.14075 14.92 7.85925 14.92 7.62949 14.7895L5.2 13.4091C5.13241 13.3704 5.06574 13.3306 5 13.2897ZM5 10.4025C5 10.5781 5.05985 10.7499 5.18057 10.8775C5.47045 11.1838 5.80907 11.4528 6.19121 11.672L6.19398 11.6736L7.62949 12.4892C7.85925 12.6197 8.14075 12.6197 8.3705 12.4892L9.7866 11.6846C10.1813 11.4435 10.5266 11.1621 10.8197 10.8502C10.94 10.7222 11 10.5505 11 10.3749V10C11 8.89543 10.1046 8 9 8H7C5.89543 8 5 8.89543 5 10V10.4025ZM10 5C10 6.10457 9.10457 7 8 7C6.89543 7 6 6.10457 6 5C6 3.89543 6.89543 3 8 3C9.10457 3 10 3.89543 10 5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Access16Icon
