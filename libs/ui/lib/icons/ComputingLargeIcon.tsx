import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function ComputingLargeIcon({
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
        d="M21 13V3H3v10h18zM1 1h22v14H1V1zm0 16v6h22v-6H1zm5 3a2 2 0 11-4 0 2 2 0 014 0z"
        fill="#48D597"
      />
    </svg>
  )
}

export default ComputingLargeIcon
