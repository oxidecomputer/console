import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const AddRoundel16Icon = ({
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
    <g id="16/add-roundel">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 15C11.866 15 15 11.866 15 8C15 4.13401 11.866 1 8 1C4.13401 1 1 4.13401 1 8C1 11.866 4.13401 15 8 15ZM7 4.75C7 4.33579 7.33579 4 7.75 4H8.25C8.66421 4 9 4.33579 9 4.75V7H11.25C11.6642 7 12 7.33579 12 7.75V8.25C12 8.66421 11.6642 9 11.25 9H9V11.25C9 11.6642 8.66421 12 8.25 12H7.75C7.33579 12 7 11.6642 7 11.25V9H4.75C4.33579 9 4 8.66421 4 8.25V7.75C4 7.33579 4.33579 7 4.75 7H7V4.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default AddRoundel16Icon
