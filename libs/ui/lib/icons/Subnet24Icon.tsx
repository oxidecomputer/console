import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Subnet24Icon = ({
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
    <g id="24/subnet">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 2H2V10H5V14H2V22H10V19H14V22H22V14H19V10H22V2H14V5L10 5V2ZM17 14V10H14V7L10 7V10H7V14H10V17H14V14H17Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Subnet24Icon
