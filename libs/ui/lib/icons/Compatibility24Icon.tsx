import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Compatibility24Icon = ({
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
    <g id="24/compatibility">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 9V1H21V9H15V5H9V9H3ZM15 12V16H21V23H3V16H9V12H15Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Compatibility24Icon
