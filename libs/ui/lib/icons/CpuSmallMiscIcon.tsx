import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const CpuSmallMiscIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={15}
    height={15}
    viewBox="0 0 15 15"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="misc/cpu-small">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 3L8 3L8 1H7L7 3ZM11 4H4V11H11V4ZM6 3L5 3L5 1H6L6 3ZM9 3L10 3L10 1H9L9 3ZM8 14H7L7 12H8L8 14ZM5 14H6L6 12H5L5 14ZM10 14H9L9 12H10L10 14ZM12 7V8L14 8V7L12 7ZM12 6V5L14 5V6L12 6ZM12 9V10L14 10V9L12 9ZM1 8V7L3 7L3 8L1 8ZM1 5V6L3 6L3 5L1 5ZM1 10V9L3 9L3 10L1 10Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default CpuSmallMiscIcon
