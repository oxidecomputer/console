import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Resize16Icon = ({
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
    <g id="16/resize">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 0.75V1.25C11 1.66421 11.3358 2 11.75 2L14 2V4.25C14 4.66421 14.3358 5 14.75 5H15.25C15.6642 5 16 4.66421 16 4.25V2V0.75C16 0.335787 15.6642 0 15.25 0H14H11.75C11.3358 0 11 0.335786 11 0.75ZM0.75 11H1.25C1.66421 11 2 11.3358 2 11.75L2 14L4.25 14C4.66421 14 5 14.3358 5 14.75V15.25C5 15.6642 4.66421 16 4.25 16H2H0.749999C0.335786 16 0 15.6642 0 15.25V14V11.75C0 11.3358 0.335787 11 0.75 11ZM4.75 4H11.25C11.6642 4 12 4.33579 12 4.75V11.25C12 11.6642 11.6642 12 11.25 12H4.75C4.33579 12 4 11.6642 4 11.25V4.75C4 4.33579 4.33579 4 4.75 4Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Resize16Icon
