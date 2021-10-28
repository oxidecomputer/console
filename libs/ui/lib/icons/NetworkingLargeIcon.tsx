import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function NetworkingLargeIcon({
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
        d="M11 3H3v8h8V3zm10 0h-8v8h8V3zm-8 10h8v8h-8v-8zm-5 0H6v5h5v-2H8v-3z"
        fill="#48D597"
      />
    </svg>
  )
}

export default NetworkingLargeIcon
