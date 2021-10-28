import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Dashboard16Icon({
  title = 'Dashboard',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 1H1v8h6V1zm8 0H9v4h6V1zM1 11h6v4H1v-4zm14-4H9v8h6V7z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Dashboard16Icon
