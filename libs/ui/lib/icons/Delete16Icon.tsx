import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Delete16Icon = ({
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
    <g id="16/delete">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 0H10L11 1H14V3H2V1H5L6 0ZM13 5H3V16H13V5ZM5 14V7H7V14H5ZM11 14V7H9V14H11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Delete16Icon
