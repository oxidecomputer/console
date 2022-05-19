import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Clipboard16Icon = ({
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
    <g id="16/clipboard">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 1H6V3H10V1ZM2 2H4V5H12V2H14V15H2V2Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Clipboard16Icon
