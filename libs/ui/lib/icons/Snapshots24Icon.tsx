import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Snapshots24Icon({
  title = 'Snapshots',
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
        d="M12 1L1 7l11 6 11-6-11-6zm0 15L2 10.546 1 10v2l11 6 11-6v-2l-1 .546L12 16zm-10-.454L12 21l10-5.454L23 15v2l-11 6-11-6v-2l1 .546z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Snapshots24Icon
