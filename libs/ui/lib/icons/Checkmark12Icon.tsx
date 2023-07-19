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
const Checkmark12Icon = ({
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
    <g id="12/checkmark">
      <path
        id="checkmark"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.4921 2.6513C10.7722 2.89273 10.8024 3.31589 10.5595 3.59467L5.4466 9.46278C5.19323 9.75357 4.74678 9.7695 4.47333 9.49751L1.47543 6.51556C1.21327 6.2548 1.21327 5.83053 1.47543 5.56977L1.7118 5.33466C1.97199 5.07585 2.39237 5.07585 2.65256 5.33466L4.89106 7.56125L9.30074 2.50024C9.54183 2.22354 9.96117 2.19359 10.2391 2.43321L10.4921 2.6513Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Checkmark12Icon
