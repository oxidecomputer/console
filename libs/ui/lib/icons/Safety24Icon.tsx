import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Safety24Icon = ({
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
    <g id="24/safety">
      <path
        id="Rectangle 820"
        d="M3 4L12 1L21 4V13.2928C21 16.1981 19.4249 18.8751 16.8851 20.286L12 23L7.11486 20.286C4.57514 18.8751 3 16.1981 3 13.2928V4Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Safety24Icon
