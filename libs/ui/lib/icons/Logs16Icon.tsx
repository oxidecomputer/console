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
const Logs16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/logs">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.750002 3C0.335788 3 0 3.33579 0 3.75V6.25C0 6.66421 0.335788 7 0.750002 7L1 7V10V11.25C1 11.6642 1.33579 12 1.75 12H3H6V10H3L3 7L3.25 7C3.66422 7 4 6.66421 4 6.25V3.75C4 3.33579 3.66422 3 3.25 3H0.750002ZM6.75 3C6.33579 3 6 3.33579 6 3.75V6.25C6 6.66421 6.33579 7 6.75 7H15.25C15.6642 7 16 6.66421 16 6.25V3.75C16 3.33579 15.6642 3 15.25 3H6.75ZM6 9.75C6 9.33579 6.33579 9 6.75 9H15.25C15.6642 9 16 9.33579 16 9.75V12.25C16 12.6642 15.6642 13 15.25 13H6.75C6.33579 13 6 12.6642 6 12.25V9.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Logs16Icon
