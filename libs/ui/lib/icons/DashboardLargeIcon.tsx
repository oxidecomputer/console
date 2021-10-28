import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function DashboardLargeIcon({
  title = 'Dashboard',
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
        d="M11 2H2v12h9V2zm11 0h-9v6h9V2zM2 16h9v6H2v-6zm20-6h-9v12h9V10z"
        fill="#48D597"
      />
    </svg>
  )
}

export default DashboardLargeIcon
