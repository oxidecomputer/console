import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Networking24Icon = ({
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
    <g id="24/networking">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 3H3V11H11V3ZM21 3H13V11H21V3ZM13 13H21V21H13V13ZM8 13H6V16V18H8H11V16H8V13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Networking24Icon
