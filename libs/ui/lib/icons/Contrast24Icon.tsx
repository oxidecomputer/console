import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const Contrast24Icon = ({
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
    <g id="24/contrast">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM14.6788 18.4672C13.8295 18.8189 12.9193 19 12 19V12V5C12.9193 5 13.8295 5.18106 14.6788 5.53284C15.5281 5.88463 16.2997 6.40024 16.9497 7.05025C17.5998 7.70026 18.1154 8.47194 18.4672 9.32122C18.8189 10.1705 19 11.0807 19 12C19 12.9193 18.8189 13.8295 18.4672 14.6788C18.1154 15.5281 17.5998 16.2997 16.9497 16.9497C16.2997 17.5998 15.5281 18.1154 14.6788 18.4672Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default Contrast24Icon
