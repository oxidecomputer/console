import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function IP224Icon({
  title = 'IP',
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
        d="M12.555 9.962a4.036 4.036 0 01-1.354-.042l-2.812 4.871a4 4 0 11-1.872-.758L9.4 9.04a4 4 0 115.018.147l2.82 4.886a4 4 0 11-1.81.864l-2.873-4.975z"
        fill="currentColor"
      />
    </svg>
  )
}

export default IP224Icon
