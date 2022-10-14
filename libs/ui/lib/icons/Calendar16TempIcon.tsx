import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Calendar16TempIcon = ({
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
    <g id="16_temp/Calendar">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 3H1V6H15V3H13V1H11V3H5V1H3V3ZM1 7H15V15H1V7ZM3 13V9H7V13H3Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Calendar16TempIcon
