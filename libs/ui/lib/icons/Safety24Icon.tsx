import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Safety24Icon = ({
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
    <g id="24/safety">
      <path
        id="Vector"
        d="M12 23L7.8 20.5C4.8 18.7 3 15.4 3 11.9V3L12 1L21 3V11.9C21 15.4 19.2 18.6 16.2 20.5L12 23Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Safety24Icon
