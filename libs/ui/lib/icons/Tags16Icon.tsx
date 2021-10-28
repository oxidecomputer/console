import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Tags16Icon({
  title = 'Tags',
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
        d="M14 0l2 2v4L6 16l-6-6L10 0h4zm-2 6a2 2 0 100-4 2 2 0 000 4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Tags16Icon
