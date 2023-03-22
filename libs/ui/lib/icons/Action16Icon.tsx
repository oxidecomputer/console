import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Action16Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="16/action">
      <path
        id="Vector"
        d="M9 7H12.9777C13.3938 7 13.6278 7.47854 13.3724 7.80697L7.89468 14.8497C7.60239 15.2255 7 15.0188 7 14.5427V9H3.02232C2.60625 9 2.3722 8.52146 2.62764 8.19303L8.10533 1.1503C8.39761 0.774504 9 0.981191 9 1.45727V7Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Action16Icon
