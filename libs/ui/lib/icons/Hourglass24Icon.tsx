import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Hourglass24Icon = ({
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
    <g id="24/hourglass">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 1H21V3H19V8L12 12L5 8L5 3H3V1H19ZM12 12L5 16V21H3V23H5H7H17H19H21V21H19V16L12 12ZM7 21V17.1606L12 14.3035L17 17.1606V21H7Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Hourglass24Icon
