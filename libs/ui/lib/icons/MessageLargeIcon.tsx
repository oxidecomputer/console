import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function MessageLargeIcon({
  title = 'Message',
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
        d="M12 10.2L3.7 4h16.6L12 10.2zm-10-5l10 7.6 10-7.6V19H2V5.2z"
        fill="#48D597"
      />
    </svg>
  )
}

export default MessageLargeIcon
