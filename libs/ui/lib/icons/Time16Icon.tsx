import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Time16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/time">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM7 3.75C7 3.33579 7.33579 3 7.75 3H8.25C8.66421 3 9 3.33579 9 3.75V7H11.25C11.6642 7 12 7.33579 12 7.75V8.25C12 8.66421 11.6642 9 11.25 9H9H7.75C7.33579 9 7 8.66421 7 8.25V7V3.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Time16Icon
