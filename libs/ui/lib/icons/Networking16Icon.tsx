import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Networking16Icon = ({
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
    <g id="16/networking">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1H1V7H7V1ZM15 1H9V7H15V1ZM9 9H15V15H9V9ZM4 9H2V12V14H4H7V12H4V9Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Networking16Icon
