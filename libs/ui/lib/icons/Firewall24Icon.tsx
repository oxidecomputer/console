import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Firewall24Icon = ({
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
    <g id="24/firewall">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 3C2 2.44772 2.44772 2 3 2H10C10.5523 2 11 2.44772 11 3V6C11 6.55228 10.5523 7 10 7H3C2.44772 7 2 6.55228 2 6V3ZM2 18C2 17.4477 2.44772 17 3 17H10C10.5523 17 11 17.4477 11 18V21C11 21.5523 10.5523 22 10 22H3C2.44772 22 2 21.5523 2 21V18ZM3 9C2.44772 9 2 9.44772 2 10V14C2 14.5523 2.44772 15 3 15H6C6.55228 15 7 14.5523 7 14V10C7 9.44772 6.55228 9 6 9H3ZM17 10C17 9.44772 17.4477 9 18 9H21C21.5523 9 22 9.44772 22 10V14C22 14.5523 21.5523 15 21 15H18C17.4477 15 17 14.5523 17 14V10ZM14 2C13.4477 2 13 2.44772 13 3V6C13 6.55228 13.4477 7 14 7H21C21.5523 7 22 6.55228 22 6V3C22 2.44772 21.5523 2 21 2H14ZM13 18C13 17.4477 13.4477 17 14 17H21C21.5523 17 22 17.4477 22 18V21C22 21.5523 21.5523 22 21 22H14C13.4477 22 13 21.5523 13 21V18ZM11.7277 15.8232C11.8933 15.9307 12.1067 15.9307 12.2723 15.8232L13.4 15.0909C14.4 14.4 15 13.2364 15 11.9636V9.5C15 9.22386 14.7761 9 14.5 9H12H9.5C9.22386 9 9 9.22386 9 9.5V11.9636C9 13.2364 9.6 14.4364 10.6 15.0909L11.7277 15.8232Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Firewall24Icon
