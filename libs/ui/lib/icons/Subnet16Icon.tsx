import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Subnet16Icon = ({
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
    <g id="16/subnet">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 0H6V6H4V10H6V16H0V10H2V6H0V0ZM10 0H16V6H14V10H16V16H10V10H12V6H10V0Z"
        fill="#989A9B"
      />
      <path id="Vector" d="M11 4L11 2L5 2L5 4L11 4Z" fill="#989A9B" />
      <path id="Vector_2" d="M11 14L11 12L5 12L5 14L11 14Z" fill="#989A9B" />
    </g>
  </svg>
)

export default Subnet16Icon
