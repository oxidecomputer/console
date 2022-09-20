import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Security16Icon = ({
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
    <g id="16/security">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 6H10V5C10 3.89543 9.10457 3 8 3C6.89543 3 6 3.89543 6 5V6ZM4 6H2V15H14V6H12V5C12 2.79086 10.2091 1 8 1C5.79086 1 4 2.79086 4 5V6Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Security16Icon
