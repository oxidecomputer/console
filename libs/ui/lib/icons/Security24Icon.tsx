import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Security24Icon = ({
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
    <g id="24/security">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M15 6C15 4.3 13.7 3 12 3C10.3 3 9 4.3 9 6V9H15V6ZM17 9V6C17 3.2 14.8 1 12 1C9.2 1 7 3.2 7 6V9H3V23H21V9H17Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Security24Icon
