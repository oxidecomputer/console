import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Settings16Icon({
  title = 'Settings',
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
        d="M8 0L1 4v8l7 4 7-4V4L8 0zm0 12a4 4 0 100-8 4 4 0 000 8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Settings16Icon
