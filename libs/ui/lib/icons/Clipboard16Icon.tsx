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
        d="M6.75 1C6.33579 1 6 1.33579 6 1.75V2.25C6 2.66421 6.33579 3 6.75 3H9.25C9.66421 3 10 2.66421 10 2.25V1.75C10 1.33579 9.66421 1 9.25 1H6.75ZM2.75 2H4V4.25C4 4.66421 4.33579 5 4.75 5H11.25C11.6642 5 12 4.66421 12 4.25V2H13.25C13.6642 2 14 2.33579 14 2.75V14.25C14 14.6642 13.6642 15 13.25 15H2.75C2.33579 15 2 14.6642 2 14.25V2.75C2 2.33579 2.33579 2 2.75 2Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Clipboard16Icon
