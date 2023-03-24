import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const UnreadIndicator6Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={6}
    height={6}
    viewBox="0 0 6 6"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="6/unread-indicator">
      <circle id="Read Indicator" cx={3} cy={3} r={3} fill="currentColor" />
    </g>
  </svg>
)
export default UnreadIndicator6Icon
