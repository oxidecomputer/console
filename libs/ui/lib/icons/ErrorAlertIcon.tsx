import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function ErrorAlertIcon({
  title = 'Error',
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
        d="M20 10c0 5.523-4.477 10-10 10S0 15.523 0 10 4.477 0 10 0s10 4.477 10 10zm-8.946.007l3.712 3.712-1.06 1.061-3.713-3.712-3.705 3.705-1.061-1.06 3.705-3.706L5.22 6.295l1.06-1.06 3.713 3.711 3.72-3.719 1.06 1.06-3.72 3.72z"
        fill="#E86886"
      />
    </svg>
  )
}

export default ErrorAlertIcon
