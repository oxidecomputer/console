import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function CPULargeIcon({
  title,
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
        d="M13 4h-2V0h2v4zm5 2H6v12h12V6zm6 7v-2h-4v2h4zm0 2v2h-4v-2h4zm0-6V7h-4v2h4zM4 11v2H0v-2h4zm0 6v-2H0v2h4zM4 7v2H0V7h4zm7 17h2v-4h-2v4zm-2 0H7v-4h2v4zm6 0h2v-4h-2v4zM7 4h2V0H7v4zm10 0h-2V0h2v4z"
        fill="#48D597"
      />
    </svg>
  )
}

export default CPULargeIcon
