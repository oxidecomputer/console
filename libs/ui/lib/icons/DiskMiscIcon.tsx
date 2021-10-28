import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DiskMiscIcon({
  title = 'Disk',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={15}
      height={15}
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
        d="M15 5H2v5h13V8h-1V7h1V5zM7 7H6V6h1v1zm1 2h2V6H8v3zm3 0h2V6h-2v3zM1 8H0V7h1v1zM0 6h1V5H0v1zm1 4H0V9h1v1z"
        fill="#48D597"
      />
    </svg>
  )
}

export default DiskMiscIcon
