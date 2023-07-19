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
const Notifications16Icon = ({
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
    <g id="16/notifications">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1C7.44772 1 7 1.44772 7 2C7 2.05819 6.9588 2.10821 6.90202 2.12094C4.66877 2.62133 3 4.61578 3 7V9.68934C3 9.88825 2.92098 10.079 2.78033 10.2197L2.20711 10.7929C2.0745 10.9255 2 11.1054 2 11.2929C2 11.6834 2.31658 12 2.70711 12H3H13H13.2929C13.6834 12 14 11.6834 14 11.2929C14 11.1054 13.9255 10.9255 13.7929 10.7929L13.2197 10.2197C13.079 10.079 13 9.88825 13 9.68934V7C13 4.61578 11.3312 2.62133 9.09798 2.12094C9.0412 2.10821 9 2.05819 9 2C9 1.44772 8.55228 1 8 1ZM10 13C10 14.1046 9.10457 15 8 15C6.89543 15 6 14.1046 6 13H10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Notifications16Icon
