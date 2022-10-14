import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Compatibility24Icon = ({
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
    <g id="24/compatibility">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 11V2H22V11H16V7H8V11H2ZM16 13V17H22V22H2V17H8V13H16Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Compatibility24Icon
