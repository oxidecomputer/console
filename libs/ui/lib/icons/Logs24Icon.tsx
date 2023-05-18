import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Logs24Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
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
    <g id="24/logs">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M1 4C1 3.44772 1.44772 3 2 3H3H5H6C6.55228 3 7 3.44772 7 4V6C7 6.55228 6.55228 7 6 7H5V10.9728L9 11.027V11C9 10.4477 9.44772 10 10 10H22C22.5523 10 23 10.4477 23 11V13C23 13.5523 22.5523 14 22 14H10C9.4568 14 9.01476 13.5669 9.00036 13.0272L5 12.973L5 18H9C9 17.4477 9.44772 17 10 17H22C22.5523 17 23 17.4477 23 18V20C23 20.5523 22.5523 21 22 21H10C9.44772 21 9 20.5523 9 20H5H4C3.44771 20 3 19.5523 3 19L3 7H2C1.44772 7 1 6.55228 1 6V4ZM9 4C9 3.44772 9.44772 3 10 3H22C22.5523 3 23 3.44772 23 4V6C23 6.55228 22.5523 7 22 7H10C9.44772 7 9 6.55228 9 6V4Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Logs24Icon
