import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Terminal16Icon = ({
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
    <g id="16/terminal">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16 1H0V15H16V1ZM2 11V9L6 7L2 5V3L8 6V8L2 11ZM8 11H14V13H8V11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Terminal16Icon
