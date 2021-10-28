import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Error16Icon({
  title = 'Error',
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
        d="M15 8A7 7 0 111 8a7 7 0 0114 0zm-5.946.29l2.722 2.722-1.06 1.06-2.723-2.721-2.715 2.715-1.061-1.06L6.932 8.29 3.927 5.285l1.06-1.061 3.006 3.005 3.012-3.012 1.06 1.06L9.055 8.29z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Error16Icon
