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
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/wireless">
      <path
        id="Vector"
        d="M12.0469 20L22 9.6C19.8404 6.2 16.1784 4 12.0469 4C7.91549 4 4.15962 6.2 2 9.6L12.0469 20Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Wireless24Icon
