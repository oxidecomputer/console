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
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M22 2H2V18H4V22L8 18H22V2ZM6 7H18V9H6V7ZM6 11H18V13H6V11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Chat24Icon
