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
const Gateway24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/gateway">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 1H20C20.5523 1 21 1.44772 21 2V22C21 22.5523 20.5523 23 20 23H4C3.44772 23 3 22.5523 3 22V2C3 1.44772 3.44772 1 4 1ZM10.3056 6.24605C10.1204 6.3242 10 6.50569 10 6.70674V17.0252C10 17.221 10.1142 17.3987 10.2923 17.48L17.2923 20.6768C17.6234 20.828 18 20.586 18 20.222V3.75361C18 3.39587 17.6353 3.15388 17.3056 3.29293L10.3056 6.24605Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Gateway24Icon
