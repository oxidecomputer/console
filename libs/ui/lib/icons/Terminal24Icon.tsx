import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Terminal24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/terminal">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3C1.44772 3 1 3.44772 1 4V20C1 20.5523 1.44772 21 2 21H22C22.5523 21 23 20.5523 23 20V4C23 3.44772 22.5523 3 22 3H2ZM5.44029 15.2937C4.77587 15.6195 4 15.1359 4 14.3958V14.2583C4 13.8667 4.22864 13.5111 4.58497 13.3485L9.73333 11L4.58497 8.65146C4.22864 8.48891 4 8.13331 4 7.74165V7.60415C4 6.86414 4.77587 6.38048 5.44029 6.7063L11.4403 9.64861C11.7829 9.8166 12 10.1649 12 10.5465V11.4535C12 11.8351 11.7829 12.1834 11.4403 12.3514L5.44029 15.2937ZM19 16H13C12.4477 16 12 16.4477 12 17C12 17.5523 12.4477 18 13 18H19C19.5523 18 20 17.5523 20 17C20 16.4477 19.5523 16 19 16Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Terminal24Icon
