import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Organization16Icon = ({
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
    <g id="16/organization">
      <rect
        id="Rectangle 19"
        x={12.6667}
        y={4.66664}
        width={4.71403}
        height={4.71403}
        transform="rotate(45 12.6667 4.66664)"
        fill="#989A9B"
      />
      <rect
        id="Rectangle 22"
        x={8}
        y={9.33331}
        width={4.71403}
        height={4.71403}
        transform="rotate(45 8 9.33331)"
        fill="#989A9B"
      />
      <rect
        id="Rectangle 20"
        x={8}
        width={4.71403}
        height={4.71403}
        transform="rotate(45 8 0)"
        fill="#989A9B"
      />
      <rect
        id="Rectangle 21"
        x={3.33333}
        y={4.66664}
        width={4.71403}
        height={4.71403}
        transform="rotate(45 3.33333 4.66664)"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Organization16Icon
