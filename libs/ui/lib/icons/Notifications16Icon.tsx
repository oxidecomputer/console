import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Notifications16Icon = ({
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
    <g id="16/notifications">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1C7.44772 1 7 1.44772 7 2V2.10002C4.71776 2.56329 3 4.58104 3 7V10L2 11V12H3H13H14V11L13 10V7C13 4.58104 11.2822 2.56329 9 2.10002V2C9 1.44772 8.55228 1 8 1ZM10 13C10 14.1046 9.10457 15 8 15C6.89543 15 6 14.1046 6 13H10Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Notifications16Icon
