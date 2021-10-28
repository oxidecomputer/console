import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SuccessAlertIcon({
  title = 'Success',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={20}
      height={20}
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
        d="M10 20c5.523 0 10-4.477 10-10S15.523 0 10 0 0 4.477 0 10s4.477 10 10 10zm4.47-13.53L9 11.94 6.53 9.47l-1.06 1.06 3 3 .53.53.53-.53 6-6-1.06-1.06z"
        fill="#48D597"
      />
    </svg>
  )
}

export default SuccessAlertIcon
