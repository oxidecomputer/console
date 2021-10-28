import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function CompatibilityLargeIcon({
  title = 'Compatibility',
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
        d="M3 9V1h18v8h-6V5H9v4H3zm12 3v4h6v7H3v-7h6v-4h6z"
        fill="#48D597"
      />
    </svg>
  )
}

export default CompatibilityLargeIcon
