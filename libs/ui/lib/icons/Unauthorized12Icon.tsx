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
        d="M6 12C9.31371 12 12 9.31371 12 6C12 2.68629 9.31371 0 6 0C2.68629 0 0 2.68629 0 6C0 9.31371 2.68629 12 6 12ZM4.47163 8.52837C4.21115 8.78885 3.78883 8.78885 3.52835 8.52837L3.47163 8.47165C3.21115 8.21117 3.21115 7.78885 3.47163 7.52837L7.52835 3.47165C7.78883 3.21117 8.21115 3.21117 8.47163 3.47165L8.52835 3.52837C8.78883 3.78885 8.78883 4.21117 8.52835 4.47165L4.47163 8.52837Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Unauthorized12Icon
