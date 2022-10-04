import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Wireless24Icon = ({
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
    <g id="24/wireless">
      <path
        id="Vector"
        d="M12.0516 21L23 9.3C20.6244 5.475 16.5962 3 12.0516 3C7.50704 3 3.37559 5.475 1 9.3L12.0516 21Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Wireless24Icon
