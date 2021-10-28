import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function CPUMiscIcon({
  title = 'CPU',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={15}
      height={15}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7 3h1V1H7v2zm4 1H4v7h7V4zM6 3H5V1h1v2zm3 0h1V1H9v2zM8 14H7v-2h1v2zm-3 0h1v-2H5v2zm5 0H9v-2h1v2zm2-7v1h2V7h-2zm0-1V5h2v1h-2zm0 3v1h2V9h-2zM1 8V7h2v1H1zm0-3v1h2V5H1zm0 5V9h2v1H1z"
        fill="currentColor"
      />
    </svg>
  )
}

export default CPUMiscIcon
