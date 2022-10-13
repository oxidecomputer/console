import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Info8Icon = ({ title, titleId, ...props }: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={8}
    height={12}
    viewBox="0 0 8 12"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="8/info">
      <rect width={8} height={12} rx={2} fill="#1C2225" />
      <path
        id="?"
        d="M2.85779 4.91609C2.8307 4.77304 2.81264 4.51995 2.81264 4.33287C2.81264 3.29849 3.30023 2.82531 3.99549 2.82531C4.79007 2.82531 5.14221 3.3315 5.14221 3.94773C5.14221 4.65199 4.8623 5.07015 4.53725 5.41128L4.07675 5.88446C3.58014 6.40165 3.56208 6.74278 3.56208 7.05089V7.51307H4.32957V7.31499C4.32957 6.88583 4.41084 6.61073 4.69977 6.31362L5.18736 5.81843C5.61174 5.38927 6 4.74003 6 3.94773C6 2.75928 5.36795 2 3.99549 2C2.74041 2 2 2.89133 2 4.22283C2 4.35488 2.01806 4.65199 2.03612 4.79505L2.85779 4.91609ZM3.39052 8.59147V10H4.59142V8.59147H3.39052Z"
        fill="#B8BBBC"
      />
    </g>
  </svg>
)

export default Info8Icon
