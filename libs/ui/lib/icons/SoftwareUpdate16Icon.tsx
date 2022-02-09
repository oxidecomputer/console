import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SoftwareUpdate16Icon({
  title = 'SoftwareUpdate',
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
        d="M12 5L8 1 4 5h8zM1 7h14v8H1V7zm7 2l4 4H4l4-4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SoftwareUpdate16Icon
