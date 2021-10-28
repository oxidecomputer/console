import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function WarningIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={12}
      height={12}
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
        d="M6 0l6 12H0L6 0zm-.75 4h1.5v4h-1.5V4zm0 5h1.5v1.5h-1.5V9z"
        fill="#F5CF65"
      />
    </svg>
  )
}

export default WarningIcon
