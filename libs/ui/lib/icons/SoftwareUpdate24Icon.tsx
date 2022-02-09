import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function SoftwareUpdate24Icon({
  title = 'SoftwareUpdate',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={24}
      height={24}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 2l4 4H8l4-4zm10 6H2v8h20V8zm-6 6l-4-4-4 4h8zm0 8l-4-4-4 4h8z"
        fill="currentColor"
      />
    </svg>
  )
}

export default SoftwareUpdate24Icon
