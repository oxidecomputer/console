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
const Cpu24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/cpu">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 2L7 5H6C5.44772 5 5 5.44772 5 6V7L2 7V9L5 9V11L2 11V13L5 13V15L2 15V17L5 17V18C5 18.5523 5.44772 19 6 19H7L7 22H9L9 19H10.9999L10.9999 22H12.9999L12.9999 19H14.9999L14.9999 22H16.9999L16.9999 19H18C18.5523 19 19 18.5523 19 18V17L22 17V15L19 15V13L22 13V11L19 11V9L22 9V7L19 7V6C19 5.44772 18.5523 5 18 5H16.9999L16.9999 2H14.9999L14.9999 5H12.9999L12.9999 2H10.9999L10.9999 5H9L9 2H7ZM10 14V10H14V14H10ZM15.5 8H8.5C8.22386 8 8 8.22386 8 8.5V15.5C8 15.7761 8.22386 16 8.5 16H15.5C15.7761 16 16 15.7761 16 15.5V8.5C16 8.22386 15.7761 8 15.5 8Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Cpu24Icon
