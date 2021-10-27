import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function TerminalIcon({
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
        d="M0 13.139V16l11-4.708V8.708L0 4v2.862L7.883 10 0 13.139zM11 19h13v2H11v-2z"
        fill="#48D597"
      />
    </svg>
  )
}

export default TerminalIcon
