import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Health16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/health">
      <path
        id="Vector"
        d="M8 3.22775C9.6092 1.60175 12.1839 1.60175 13.7931 3.22775C15.4023 4.85376 15.4023 7.5204 13.7931 9.1464L8 15L2.2069 9.08136C0.597701 7.45536 0.597701 4.78872 2.2069 3.16271C3.81609 1.60175 6.3908 1.60175 8 3.22775Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Health16Icon
