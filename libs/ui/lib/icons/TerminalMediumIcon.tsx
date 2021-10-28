import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function TerminalMediumIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
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
        d="M16 1H0v14h16V1zM2 11V9l4-2-4-2V3l6 3v2l-6 3zm6 0h6v2H8v-2z"
        fill="#48D597"
      />
    </svg>
  )
}

export default TerminalMediumIcon
