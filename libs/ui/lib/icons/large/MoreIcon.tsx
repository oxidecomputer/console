import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function MoreIcon({
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
      <g fill="#48D597">
        <path d="M10 1h4v6h-4V1zm0 16h4v6h-4v-6zM14 9h-4v6h4V9z" />
      </g>
    </svg>
  )
}

export default MoreIcon
