import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function RAMIcon({
  title,
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
      <g fill="#48D597">
        <path d="M13 11h1v-1h-1v1zM11 11h1v-1h-1v1zM9 11h1v-1H9v1zM7 11h1v-1H7v1zM5 11h1v-1H5v1zM3 11h1v-1H3v1zM1 11h1v-1H1v1z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M0 4h15v2h-1v1h1v2H0V4zm0 3h1V6H0v1z"
        />
      </g>
    </svg>
  )
}

export default RAMIcon
