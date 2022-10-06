import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Speaker24Icon = ({
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
    <g id="24/speaker">
      <path
        id="Icon"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 7L21 1V23L11 17H3V7H11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Speaker24Icon
