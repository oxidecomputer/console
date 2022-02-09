import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Link16Icon({
  title = 'Link',
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
      <g fill="currentColor">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M14 5v6h-4v2h6V3h-6v2h4zM6 5V3H0v10h6v-2H2V5h4z"
        />
        <path d="M11 7v2H5V7z" />
      </g>
    </svg>
  )
}

export default Link16Icon
