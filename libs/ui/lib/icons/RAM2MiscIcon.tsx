import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function RAM2MiscIcon({
  title = 'RAM2',
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
        <path d="M17 14h1v-2h-1v2zM15 14h1v-2h-1v2zM13 14h1v-2h-1v2zM11 14h1v-2h-1v2zM9 14h1v-2H9v2zM7 14h1v-2H7v2zM5 14h1v-2H5v2zM3 14h1v-2H3v2zM1 14h1v-2H1v2z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 5.067h19V7a1 1 0 100 2v2H0V9a1 1 0 100-2V5.067zM2 6h3v4H2V6zm7 0H6v4h3V6zm1 0h3v4h-3V6zm7 0h-3v4h3V6z"
        />
      </g>
    </svg>
  )
}

export default RAM2MiscIcon
