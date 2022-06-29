import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Cloud24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/cloud">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 18.9776C5.83532 18.9924 5.66854 19 5.5 19C2.46243 19 0 16.5376 0 13.5C0 10.4869 2.42286 8.03977 5.42659 8.00048C6.45605 5.08725 9.23427 3 12.5 3C16.4829 3 19.7406 6.10463 19.9853 10.0259C22.2423 10.2679 24 12.1787 24 14.5C24 16.9853 21.9853 19 19.5 19C19.331 19 19.1642 18.9907 19 18.9725V19H6V18.9776Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Cloud24Icon
