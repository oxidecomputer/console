import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Metrics16Icon = ({
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
    <g id="16/metrics">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 1.75C9 1.33579 9.33747 0.995083 9.74851 1.04623C12.4637 1.38413 14.6159 3.53625 14.9538 6.25149C15.0049 6.66253 14.6642 7 14.25 7H9.75C9.33579 7 9 6.66421 9 6.25V1.75ZM1 9C1 5.93977 3.29103 3.41465 6.25149 3.04623C6.66253 2.99508 7 3.33579 7 3.75V8.25C7 8.66421 7.33579 9 7.75 9H12.25C12.6642 9 13.0049 9.33747 12.9538 9.74851C12.5854 12.709 10.0602 15 7 15C3.68629 15 1 12.3137 1 9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Metrics16Icon
