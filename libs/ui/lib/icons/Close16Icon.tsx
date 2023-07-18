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
const Close16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/close">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.21966 2.64375C1.92678 2.93665 1.92678 3.41154 2.21966 3.70444L6.5145 7.99959L2.21966 12.2947C1.92678 12.5876 1.92678 13.0625 2.21966 13.3554L2.6437 13.7795C2.93659 14.0724 3.41144 14.0724 3.70433 13.7795L7.99917 9.48436L12.294 13.7795C12.5869 14.0724 13.0617 14.0724 13.3546 13.7795L13.7787 13.3554C14.0716 13.0625 14.0716 12.5876 13.7787 12.2947L9.48383 7.99959L13.7787 3.70444C14.0716 3.41154 14.0716 2.93665 13.7787 2.64375L13.3546 2.21968C13.0617 1.92677 12.5869 1.92677 12.294 2.21968L7.99917 6.51482L3.70432 2.21968C3.41144 1.92677 2.93658 1.92677 2.6437 2.21968L2.21966 2.64375Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Close16Icon
