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
const Ssd16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/ssd">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.75 4H15.25C15.6642 4 16 4.33579 16 4.75V11.25C16 11.6642 15.6642 12 15.25 12H3.31066C3.11175 12 2.92098 11.921 2.78033 11.7803L0.21967 9.21967C0.0790176 9.07902 0 8.88825 0 8.68934V4.75C0 4.33579 0.335786 4 0.75 4ZM3.25003 8.00001H1.75003C1.33582 8.00001 1.00003 7.66422 1.00003 7.25001V5.75001C1.00003 5.33579 1.33582 5.00001 1.75003 5.00001H3.25003C3.66425 5.00001 4.00003 5.3358 4.00003 5.75001L4.00003 7.25001C4.00003 7.66422 3.66425 8.00001 3.25003 8.00001ZM7.75003 11L9.25003 11C9.66424 11 10 10.6642 10 10.25L10 5.75001C10 5.3358 9.66425 5.00001 9.25003 5.00001H7.75004C7.33582 5.00001 7.00004 5.33579 7.00004 5.75001L7.00003 10.25C7.00003 10.6642 7.33582 11 7.75003 11ZM11.75 11L13.25 11C13.6642 11 14 10.6642 14 10.25L14 5.75001C14 5.3358 13.6642 5.00001 13.25 5.00001H11.75C11.3358 5.00001 11 5.33579 11 5.75001L11 10.25C11 10.6642 11.3358 11 11.75 11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Ssd16Icon
