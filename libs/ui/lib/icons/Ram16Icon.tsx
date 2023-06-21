import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Ram16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/ram">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 4.75C0 4.33579 0.335786 4 0.75 4H15.25C15.6642 4 16 4.33579 16 4.75V6H14.75C14.3358 6 14 6.33579 14 6.75L14 7.25C14 7.66421 14.3358 8 14.75 8L16 8V9.25C16 9.66421 15.6642 10 15.25 10H0.75C0.335786 10 0 9.66421 0 9.25V4.75ZM6.25 9L4.75 9C4.33579 9 4 8.66421 4 8.25V5.75C4 5.33579 4.33579 5 4.75 5H6.25C6.66421 5 7 5.33579 7 5.75L7 8.25C7 8.66421 6.66421 9 6.25 9ZM11.25 9L9.75 9C9.33579 9 9 8.66421 9 8.25L9 5.75C9 5.33579 9.33579 5 9.75 5H11.25C11.6642 5 12 5.33579 12 5.75L12 8.25C12 8.66421 11.6642 9 11.25 9ZM14 11H2V12.25C2 12.6642 2.33579 13 2.75 13H13.25C13.6642 13 14 12.6642 14 12.25V11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Ram16Icon
