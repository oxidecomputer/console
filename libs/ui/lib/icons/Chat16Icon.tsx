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
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/chat">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 8C1 4.13401 4.13401 1 8 1C11.866 1 15 4.13401 15 8C15 11.866 11.866 15 8 15H1.74556C1.3338 15 1 14.6662 1 14.2544V8ZM4 6.75C4 6.33579 4.33579 6 4.75 6H11.25C11.6642 6 12 6.33579 12 6.75V7.25C12 7.66421 11.6642 8 11.25 8H4.75C4.33579 8 4 7.66421 4 7.25V6.75ZM4.75 9C4.33579 9 4 9.33579 4 9.75V10.25C4 10.6642 4.33579 11 4.75 11H8.25C8.66421 11 9 10.6642 9 10.25V9.75C9 9.33579 8.66421 9 8.25 9H4.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Chat16Icon
