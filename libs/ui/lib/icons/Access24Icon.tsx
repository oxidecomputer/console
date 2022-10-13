import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Access24Icon = ({
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
    <g id="24/access">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M3 4L12 1L21 4V13.2928C21 16.1981 19.4249 18.8751 16.8851 20.286L12 23L7.11486 20.286C4.57514 18.8751 3 16.1981 3 13.2928V4ZM16 12V18L12 20L8 18V12H16ZM12 11C13.6569 11 15 9.65685 15 8C15 6.34315 13.6569 5 12 5C10.3431 5 9 6.34315 9 8C9 9.65685 10.3431 11 12 11Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Access24Icon
