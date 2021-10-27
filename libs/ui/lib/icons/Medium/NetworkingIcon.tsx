import * as React from 'react'
interface SVGRProps {
  title: string
  titleId?: string
}

function NetworkingIcon({
  title,
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={16}
      height={16}
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
        d="M7 1H1v6h6V1zm8 0H9v6h6V1zM9 9h6v6H9V9zM4 9H2v5h5v-2H4V9z"
        fill="#48D597"
      />
    </svg>
  )
}

export default NetworkingIcon
