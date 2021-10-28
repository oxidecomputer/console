import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function CloseExtraSmallIcon({
  title = 'CloseExtra',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={8}
      height={8}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <g fill="#48D597">
        <path d="M7.182 1.525L1.525 7.182l-.707-.707L6.475.818z" />
        <path d="M6.475 7.182L.818 1.525l.707-.707 5.657 5.657z" />
      </g>
    </svg>
  )
}

export default CloseExtraSmallIcon
