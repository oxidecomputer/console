import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function LightDarkLargeIcon({
  title = 'LightDark',
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
        d="M19 12c0-3.9-3.1-7-7-7v14c3.9 0 7-3.1 7-7zm-7 10C6.5 22 2 17.5 2 12S6.5 2 12 2s10 4.5 10 10-4.5 10-10 10z"
        fill="#48D597"
      />
    </svg>
  )
}

export default LightDarkLargeIcon
