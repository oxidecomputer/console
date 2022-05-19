import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Instances24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/instances">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 5V2H22V17H19V5H7ZM2 7H17V22H2V7Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Instances24Icon
