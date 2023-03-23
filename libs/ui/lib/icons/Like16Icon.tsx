import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Like16Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="16/like">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.60407 1.49491L4 6V15H11.5363C11.8204 15 12.0801 14.8395 12.2071 14.5854L15 9V8C15 6.89543 14.1046 6 13 6H9L9.61139 3.55444C9.83845 2.6462 9.40423 1.70212 8.56688 1.28344C8.23623 1.11811 7.83501 1.20623 7.60407 1.49491ZM1.75 6C1.33579 6 1 6.33579 1 6.75V14.25C1 14.6642 1.33579 15 1.75 15H3V6H1.75Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Like16Icon
