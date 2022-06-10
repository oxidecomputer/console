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
        d="M7 2H17V8L12 12L7 8V2ZM9 16.9613V20H15V16.9612L12 14.5612L9 16.9613ZM12 12L17 16V20V22H15H9H7V20V16L12 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Hourglass24Icon
