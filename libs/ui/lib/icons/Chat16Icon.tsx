import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Chat16Icon({
  title = '',
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
        d="M0 2h16v9H5l-3 3v-3H0V2z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Chat16Icon
