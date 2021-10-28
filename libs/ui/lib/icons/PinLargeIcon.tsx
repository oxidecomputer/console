import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function PinLargeIcon({
  title = 'Pin',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13 11.9A5.002 5.002 0 0012 2a5 5 0 00-1 9.9V23h2V11.9z"
        fill="#48D597"
      />
    </svg>
  )
}

export default PinLargeIcon
