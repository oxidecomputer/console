import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Access16Icon({
  title = '',
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
        d="M5 13.29a6.316 6.316 0 01-3-5.354V3l6-2 6 2v4.936c0 2.152-1.12 4.126-3 5.348a7.33 7.33 0 01-.2.125L8 15l-2.8-1.59a6.375 6.375 0 01-.2-.12zM5 8v2.674c.327.392.727.732 1.191.998l.003.002L8 12.7l1.787-1.015A4.9 4.9 0 0011 10.647V8H5zm5-3a2 2 0 11-4 0 2 2 0 014 0z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Access16Icon
