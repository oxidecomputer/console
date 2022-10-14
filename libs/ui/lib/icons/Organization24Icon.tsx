import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Organization24Icon = ({
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
    <g id="24/organization">
      <g id="Union">
        <path d="M10.625 12L5.8125 7.18749L1 12L5.8125 16.8125L10.625 12Z" fill="#B8BBBC" />
        <path d="M23 12L18.1875 7.1875L13.375 12L18.1875 16.8125L23 12Z" fill="#B8BBBC" />
        <path d="M12 1L16.8125 5.8125L12 10.625L7.18749 5.8125L12 1Z" fill="#B8BBBC" />
        <path
          d="M16.8125 18.1875L12 13.375L7.18747 18.1875L12 23L16.8125 18.1875Z"
          fill="#B8BBBC"
        />
      </g>
    </g>
  </svg>
)

export default Organization24Icon
