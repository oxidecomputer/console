import * as React from 'react'
interface SVGRProps {
  title?: string
  titleId?: string
}

function InfoMiscIcon({
  title = 'Info',
  titleId,
  ...props
}: React.SVGProps<SVGSVGElement> & SVGRProps) {
  return (
    <svg
      width={9}
      height={15}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-labelledby={titleId}
      {...props}
    >
      {title ? <title id={titleId}>{title}</title> : null}
      <path
        d="M0 1a1 1 0 011-1h7a1 1 0 011 1v13a1 1 0 01-1 1H1a1 1 0 01-1-1V1z"
        fill="currentColor"
      />
      <path
        d="M3.14 6.18a3.37 3.37 0 01-.06-.636c0-1.128.648-1.644 1.572-1.644 1.056 0 1.524.552 1.524 1.224 0 .768-.372 1.224-.804 1.596l-.612.516c-.66.564-.684.936-.684 1.272v.504h1.02v-.216c0-.468.108-.768.492-1.092l.648-.54c.564-.468 1.08-1.176 1.08-2.04C7.316 3.828 6.476 3 4.652 3 2.984 3 2 3.972 2 5.424c0 .144.024.468.048.624l1.092.132zm.708 4.008v1.536h1.596v-1.536H3.848z"
        fill="currentColor"
      />
    </svg>
  )
}

export default InfoMiscIcon
