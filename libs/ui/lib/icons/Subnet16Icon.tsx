import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Subnet16Icon = ({
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
    <g id="16/subnet">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.75 0H5.25C5.66421 0 6 0.335786 6 0.75V2L10 2V0.75C10 0.335786 10.3358 0 10.75 0H15.25C15.6642 0 16 0.335786 16 0.75V5.25C16 5.66421 15.6642 6 15.25 6H14V10H15.25C15.6642 10 16 10.3358 16 10.75V15.25C16 15.6642 15.6642 16 15.25 16H10.75C10.3358 16 10 15.6642 10 15.25V14H6V15.25C6 15.6642 5.66421 16 5.25 16H0.75C0.335786 16 0 15.6642 0 15.25V10.75C0 10.3358 0.335786 10 0.75 10H2V6H0.75C0.335786 6 0 5.66421 0 5.25V0.75C0 0.335786 0.335786 0 0.75 0ZM6 12H10V10.75C10 10.3358 10.3358 10 10.75 10H12V6H10.75C10.3358 6 10 5.66421 10 5.25V4H6V5.25C6 5.66421 5.66421 6 5.25 6H4V10H5.25C5.66421 10 6 10.3358 6 10.75V12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Subnet16Icon
