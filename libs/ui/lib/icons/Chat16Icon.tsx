import * as React from 'react'
import type { SVGProps } from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

const Chat16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/chat">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 2H16V11H5L2 14V11H0V2Z"
        fill="#989A9B"
      />
    </g>
  </svg>
)

export default Chat16Icon
