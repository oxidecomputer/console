import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Overview16Icon = ({
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
    <g id="16/overview">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1H1V9H7V1ZM15 1H9V5H15V1ZM1 11H7V15H1V11ZM15 7H9V15H15V7Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Overview16Icon
