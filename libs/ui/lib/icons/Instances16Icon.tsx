import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Instances16Icon = ({
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
    <g id="16/instances">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 1.75C6 1.33579 6.33579 1 6.75 1H14.25C14.6642 1 15 1.33579 15 1.75V9.25C15 9.66421 14.6642 10 14.25 10H13V3.75C13 3.33579 12.6642 3 12.25 3H6V1.75ZM1 5.75C1 5.33579 1.33579 5 1.75 5H10.25C10.6642 5 11 5.33579 11 5.75V14.25C11 14.6642 10.6642 15 10.25 15H1.75C1.33579 15 1 14.6642 1 14.25V5.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Instances16Icon
