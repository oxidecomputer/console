import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function GroupsLargeIcon({
  title = 'Groups',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.586 12l-4.95-4.95L.686 12l4.95 4.95 4.95-4.95zm12.728 0l-4.95-4.95-4.95 4.95 4.95 4.95 4.95-4.95zM12 .686l4.95 4.95-4.95 4.95-4.95-4.95L12 .686zm4.95 17.678L12 13.414l-4.95 4.95 4.95 4.95 4.95-4.95z"
        fill="currentColor"
      />
    </svg>
  )
}

export default GroupsLargeIcon
