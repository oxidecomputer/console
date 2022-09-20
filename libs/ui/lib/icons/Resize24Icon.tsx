import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Resize24Icon = ({
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
    <g id="24/resize">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19 5V9H22V5V2H19H15V5H19ZM7 7H17V17H7V7ZM5 19L5 15H2V19V22H5H9V19H5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Resize24Icon
