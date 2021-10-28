import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function Delivery24Icon({
  title = 'Delivery',
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
        d="M12 11.9l10-5.5L12 1 2 6.4l10 5.5zm-1 1.7L1 8.1V18l10 5.5v-9.9zm2 9.9v-9.9l10-5.5V18l-10 5.5z"
        fill="currentColor"
      />
    </svg>
  )
}

export default Delivery24Icon
