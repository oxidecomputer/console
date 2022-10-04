import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Progress24Icon = ({
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
    <g id="24/progress">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M21 1H17V23H21V1ZM10 8H14V23H10V8ZM3 15H7V23H3V15Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Progress24Icon
