import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Prohibited24Icon = ({
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
    <g id="24/prohibited">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.4903 5.38839C15.2079 4.513 13.661 4 12 4C7.6 4 4 7.6 4 12C4 13.661 4.513 15.2079 5.38839 16.4903L16.4903 5.38839ZM18.6116 7.50971L7.50971 18.6116C8.79206 19.487 10.339 20 12 20C16.4 20 20 16.4 20 12C20 10.339 19.487 8.79206 18.6116 7.50971ZM1 12C1 5.9 5.9 1 12 1C18.1 1 23 5.9 23 12C23 18.1 18.1 23 12 23C5.9 23 1 18.1 1 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Prohibited24Icon
