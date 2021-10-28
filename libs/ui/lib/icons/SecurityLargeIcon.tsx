import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SecurityLargeIcon({
  title = 'Security',
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
        d="M15 7c0-1.7-1.3-3-3-3S9 5.3 9 7v2h6V7zm2 2V7c0-2.8-2.2-5-5-5S7 4.2 7 7v2H4v13h16V9h-3z"
        fill="#48D597"
      />
    </svg>
  )
}

export default SecurityLargeIcon
