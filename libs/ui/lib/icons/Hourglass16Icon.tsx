import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Hourglass16Icon = ({
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
    <g id="16/hourglass">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M4 0H3.75C3.33579 0 3 0.335786 3 0.75V1.25C3 1.66421 3.33579 2 3.75 2H4L4 4.625C4 4.86107 4.11115 5.08336 4.3 5.225L8 8L4.3 10.775C4.11115 10.9166 4 11.1389 4 11.375V14H3.75C3.33579 14 3 14.3358 3 14.75V15.25C3 15.6642 3.33579 16 3.75 16H4H6H10H12H12.25C12.6642 16 13 15.6642 13 15.25V14.75C13 14.3358 12.6642 14 12.25 14H12V11.375C12 11.1389 11.8889 10.9166 11.7 10.775L8 8L11.7 5.225C11.8889 5.08336 12 4.86107 12 4.625V2H12.25C12.6642 2 13 1.66421 13 1.25V0.75C13 0.335786 12.6642 0 12.25 0H12H4ZM10 12V14H6V12L8 10.5L10 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Hourglass16Icon
