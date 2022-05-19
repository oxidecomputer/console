import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Issues24Icon = ({
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
    <g id="24/issues">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 3H7H8H15V6L20 6V15H12V12H8V21H6V3Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Issues24Icon
