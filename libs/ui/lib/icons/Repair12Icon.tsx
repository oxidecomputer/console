import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Repair12Icon = ({
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
    <g id="12/repair">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.6465 7.6465C5.14435 7.87359 4.58694 8 4 8C1.79086 8 0 6.20914 0 4C0 3.41306 0.126416 2.85565 0.353505 2.35351L3 5L5 3L2.3535 0.353506C2.85565 0.126417 3.41306 0 4 0C6.20914 0 8 1.79086 8 4C8 4.58694 7.87358 5.14435 7.6465 5.6465L12 10L10 12L5.6465 7.6465Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Repair12Icon
