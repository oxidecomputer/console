import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Contrast24Icon = ({
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
    <g id="24/contrast">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.7 12C19.7 7.71 16.29 4.3 12 4.3V19.7C16.29 19.7 19.7 16.29 19.7 12ZM12 23C5.95 23 1 18.05 1 12C1 5.95 5.95 1 12 1C18.05 1 23 5.95 23 12C23 18.05 18.05 23 12 23Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Contrast24Icon
