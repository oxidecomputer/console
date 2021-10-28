import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function Disk2MiscIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={19}
      height={19}
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
        d="M3 6h16v2a1 1 0 00-1 1v1a1 1 0 001 1v2H3V6zm10 6h-3V7h3v5zm4 0h-3V7h3v5zM7 9h2V7H7v2zm-7 2h2v-1H0v1zm2-2H0V8h2v1zM0 7h2V6H0v1zm2 6H0v-1h2v1z"
        fill="#48D597"
      />
    </svg>
  )
}

export default Disk2MiscIcon
