import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function CPU2MiscIcon({
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
      <g fill="#48D597">
        <path d="M14 5H5v9h9V5zM10 4h1V1h-1v3zM10 18h1v-3h-1v3zM8 4h1V1H8v3zM8 18h1v-3H8v3zM6 4h1V1H6v3zM6 18h1v-3H6v3zM12 4h1V1h-1v3zM12 18h1v-3h-1v3zM15 10v1h3v-1h-3zM1 10v1h3v-1H1zM15 8v1h3V8h-3zM1 8v1h3V8H1zM15 6v1h3V6h-3zM1 6v1h3V6H1zM15 12v1h3v-1h-3zM1 12v1h3v-1H1z" />
      </g>
    </svg>
  )
}

export default CPU2MiscIcon
