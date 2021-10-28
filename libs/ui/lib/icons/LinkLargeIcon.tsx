import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function LinkLargeIcon({
  title = 'Link',
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
      <g fill="currentColor">
        <path d="M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M20.993 21c.005-.166.007-.333.007-.5C21 10.835 13.165 3 3.5 3c-.167 0-.334.002-.5.007v3.001c.166-.005.333-.008.5-.008C11.508 6 18 12.492 18 20.5c0 .167-.003.334-.009.5h3.002zm-6.004 0c.007-.166.011-.332.011-.5C15 14.149 9.851 9 3.5 9c-.168 0-.334.004-.5.01v3.005A8.5 8.5 0 0111.986 21h3.003z"
        />
      </g>
    </svg>
  )
}

export default LinkLargeIcon
