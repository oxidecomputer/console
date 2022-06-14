import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Chat24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/chat">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 3H24V17H8L3 22V17H0V3Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Chat24Icon
