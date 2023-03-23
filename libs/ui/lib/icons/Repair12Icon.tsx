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
        d="M5.6465 7.6465C5.14435 7.87359 4.58694 8 4 8C1.79086 8 0 6.20914 0 4C0 3.75127 0.0227038 3.50783 0.0661511 3.27166C0.150509 2.81311 0.70579 2.70579 1.03548 3.03547L2.76418 4.76418C2.89442 4.89442 3.10558 4.89442 3.23582 4.76418L4.76418 3.23582C4.89442 3.10558 4.89442 2.89442 4.76418 2.76418L3.03548 1.03548C2.70579 0.70579 2.81311 0.150509 3.27166 0.0661513C3.50783 0.0227041 3.75127 0 4 0C6.20914 0 8 1.79086 8 4C8 4.58694 7.87358 5.14435 7.6465 5.6465L11.5284 9.52836C11.7888 9.78884 11.7888 10.2112 11.5284 10.4716L10.4716 11.5284C10.2112 11.7888 9.78884 11.7888 9.52836 11.5284L5.6465 7.6465Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Repair12Icon
