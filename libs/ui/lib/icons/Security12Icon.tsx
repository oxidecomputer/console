import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Security12Icon = ({
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
    <g id="12/security">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 5H8V4C8 2.89543 7.10457 2 6 2C4.89543 2 4 2.89543 4 4V5ZM2 5H1V12H11V5H10V4C10 1.79086 8.20914 0 6 0C3.79086 0 2 1.79086 2 4V5Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Security12Icon
