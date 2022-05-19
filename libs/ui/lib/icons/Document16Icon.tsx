import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Document16Icon = ({
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
    <g id="16/document">
      <path
        id="Vector"
        d="M11.5 0H2V16H14V2.54545L11.5 0ZM4 8H9V10H4V8ZM10 13H4V11H10V13ZM11 7.09091H4V5H11V7.09091Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Document16Icon
