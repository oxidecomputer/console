import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Unauthorized12Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={12}
    height={12}
    viewBox="0 0 12 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="12/unauthorized">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM8.99999 4.00001L3.99999 9.00001L2.99999 8.00001L7.99999 3.00001L8.99999 4.00001Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Unauthorized12Icon
