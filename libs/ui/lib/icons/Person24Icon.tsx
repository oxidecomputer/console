import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Person24Icon = ({
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
    <g id="24/person">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 8C18 11.3137 15.3137 14 12 14C8.68629 14 6 11.3137 6 8C6 4.68629 8.68629 2 12 2C15.3137 2 18 4.68629 18 8ZM1 21.4545C1 18.4421 3.44208 16 6.45455 16H17.5455C20.5579 16 23 18.4421 23 21.4545C23 21.7558 22.7558 22 22.4545 22H1.54545C1.24421 22 1 21.7558 1 21.4545Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Person24Icon
