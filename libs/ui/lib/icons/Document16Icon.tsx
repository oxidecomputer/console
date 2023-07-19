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
const Document16Icon = ({
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
    <g id="16/document">
      <path
        id="Vector"
        d="M11.7205 0.224469C11.5794 0.0808843 11.3866 0 11.1854 0H2.75C2.33579 0 2 0.335786 2 0.75V15.25C2 15.6642 2.33579 16 2.75 16H13.25C13.6642 16 14 15.6642 14 15.25V2.85216C14 2.65559 13.9228 2.46688 13.7851 2.32663L11.7205 0.224469ZM4 8.75C4 8.33579 4.33579 8 4.75 8H8.25C8.66421 8 9 8.33579 9 8.75V9.25C9 9.66421 8.66421 10 8.25 10H4.75C4.33579 10 4 9.66421 4 9.25V8.75ZM10 12.25C10 12.6642 9.66421 13 9.25 13H4.75C4.33579 13 4 12.6642 4 12.25V11.75C4 11.3358 4.33579 11 4.75 11H9.25C9.66421 11 10 11.3358 10 11.75V12.25ZM11 6.34091C11 6.75512 10.6642 7.09091 10.25 7.09091H4.75C4.33579 7.09091 4 6.75512 4 6.34091V5.75C4 5.33579 4.33579 5 4.75 5H10.25C10.6642 5 11 5.33579 11 5.75V6.34091Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Document16Icon
