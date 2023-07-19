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
const Tags16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/tags">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15.7803 1.78033C15.921 1.92098 16 2.11175 16 2.31066V5.68934C16 5.88825 15.921 6.07902 15.7803 6.21967L6.53033 15.4697C6.23744 15.7626 5.76256 15.7626 5.46967 15.4697L0.53033 10.5303C0.237437 10.2374 0.237437 9.76256 0.53033 9.46967L9.78033 0.21967C9.92098 0.0790177 10.1117 0 10.3107 0H13.6893C13.8883 0 14.079 0.0790176 14.2197 0.21967L15.7803 1.78033ZM12 6C13.1046 6 14 5.10457 14 4C14 2.89543 13.1046 2 12 2C10.8954 2 10 2.89543 10 4C10 5.10457 10.8954 6 12 6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Tags16Icon
