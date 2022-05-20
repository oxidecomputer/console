import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const OpenLink12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/open-link">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 1H5.0201L6.01005 1.98995L6.0201 2H2V10H10V5.9799L10.0101 5.98995L11 6.9799V10V11H10H2H1V10V2V1H2ZM10 4L8 2L7 1H8.9799H9.6H10H11V2V2.4V3.0201V5L10 4Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default OpenLink12Icon
