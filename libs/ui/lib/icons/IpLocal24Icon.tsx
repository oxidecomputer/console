import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const IpLocal24Icon = ({
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
    <g id="24/ip-local">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.5553 9.96177C12.3738 9.98697 12.1884 10 12 10C11.7263 10 11.459 9.97251 11.2008 9.92015L8.38854 14.7911C9.36661 15.5203 10 16.6862 10 18C10 20.2091 8.20914 22 6 22C3.79086 22 2 20.2091 2 18C2 15.7909 3.79086 14 6 14C6.17512 14 6.34762 14.0113 6.5168 14.0331L9.39977 9.03963C8.54297 8.306 8 7.21641 8 6C8 3.79086 9.79086 2 12 2C14.2091 2 16 3.79086 16 6C16 7.30081 15.3791 8.45659 14.4174 9.18712L17.238 14.0725C17.4847 14.0249 17.7394 14 18 14C20.2091 14 22 15.7909 22 18C22 20.2091 20.2091 22 18 22C15.7909 22 14 20.2091 14 18C14 16.7705 14.5547 15.6705 15.4276 14.9368L12.5553 9.96177Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default IpLocal24Icon
