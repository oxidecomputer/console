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
        d="M2 2H11V11H2V2ZM13 2H22V11H13V2ZM22 13H13V22H22V13ZM8 13H6V16V18H8H11V16H8V13Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Networking24Icon
