import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function NotificationMediumIcon({
  title = 'Notification',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 1a1 1 0 00-1 1v.1A5.002 5.002 0 003 7v3l-1 1v1h12v-1l-1-1V7a5.002 5.002 0 00-4-4.9V2a1 1 0 00-1-1zm2 12a2 2 0 11-4 0h4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default NotificationMediumIcon
