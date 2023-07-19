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
const Key24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/key">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.1729 2.70708C18.5634 2.31655 19.1966 2.31655 19.5871 2.70708L20.2942 3.41418C20.6847 3.80471 20.6847 4.43787 20.2942 4.8284L20.0613 5.06129L21.2929 6.29286C21.6834 6.68339 21.6834 7.31655 21.2929 7.70708C20.9024 8.0976 20.2692 8.0976 19.8787 7.70708L18.6471 6.4755L17.1826 7.93998L18.4142 9.17154C18.8047 9.56207 18.8047 10.1952 18.4142 10.5858L17.7071 11.2929C17.3166 11.6834 16.6834 11.6834 16.2929 11.2929L15.0613 10.0613L13.6233 11.4993C14.4859 12.6024 15 13.9911 15 15.5C15 19.0898 12.0899 22 8.5 22C4.91015 22 2 19.0898 2 15.5C2 11.9101 4.91015 8.99997 8.5 8.99997C9.48858 8.99997 10.4256 9.22066 11.2645 9.61546L18.1729 2.70708ZM8.5 19C10.433 19 12 17.433 12 15.5C12 13.567 10.433 12 8.5 12C6.567 12 5 13.567 5 15.5C5 17.433 6.567 19 8.5 19Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Key24Icon
