import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Filter12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/filter">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 1H12V3H0V1ZM2 5H10V7H2V5ZM8 9H4V11H8V9Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Filter12Icon
