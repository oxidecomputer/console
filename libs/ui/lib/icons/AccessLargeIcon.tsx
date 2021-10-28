import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function AccessLargeIcon({
  title = 'Access',
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
        d="M3 4l9-3 9 3v8.183a9 9 0 01-4.008 7.489l-.992.661L12 23l-4-2.667-.992-.661A9 9 0 013 12.183V4zm5 8v5.928l.117.08L12 20.596l3.883-2.588c.04-.026.078-.053.117-.08V12H8zm7-4a3 3 0 11-6 0 3 3 0 016 0z"
        fill="#48D597"
      />
    </svg>
  )
}

export default AccessLargeIcon
