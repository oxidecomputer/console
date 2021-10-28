import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function ChatLargeIcon({
  title,
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
        d="M0 3h24v14H8l-5 5v-5H0V3z"
        fill="#48D597"
      />
    </svg>
  )
}

export default ChatLargeIcon
