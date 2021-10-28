import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Edit16Icon({
  title = 'Edit',
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
        d="M0 16v-4l9-9 4 4-9 9H0zM14 6l2-2-4-4-2 2 4 4z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Edit16Icon
