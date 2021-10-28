import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function StorageLargeIcon({
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
        d="M18 2h-2v4.1H5V2H2v20h20V7l-4-5zm-6 16c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z"
        fill="#48D597"
      />
    </svg>
  )
}

export default StorageLargeIcon
