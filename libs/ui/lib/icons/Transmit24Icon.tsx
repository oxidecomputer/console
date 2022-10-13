import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const Transmit24Icon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={24}
    height={24}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="24/transmit">
      <path
        id="Union"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 9C20 11.1831 19.1256 13.1619 17.7079 14.6053L19.1349 16.0067C20.907 14.2023 22 11.7288 22 9C22 6.27261 20.9081 3.80025 19.1377 1.99616L17.7101 3.39693C19.1265 4.8402 20 6.81809 20 9ZM4 9C4 11.1831 4.87441 13.1619 6.29209 14.6053L4.86512 16.0067C3.09301 14.2023 2 11.7288 2 9C2 6.27261 3.09187 3.80025 4.86233 1.99616L6.28987 3.39693C4.87349 4.8402 4 6.81809 4 9ZM6 9C6 10.6373 6.65581 12.1214 7.71907 13.204L9.14605 11.8027C8.4372 11.0809 8 10.0915 8 9C8 7.90905 8.43675 6.9201 9.14493 6.19846L7.7174 4.7977C6.65512 5.88015 6 7.36357 6 9ZM14.854 11.8027L16.2809 13.204C17.3442 12.1214 18 10.6373 18 9C18 7.36357 17.3449 5.88015 16.2826 4.7977L14.8551 6.19846C15.5633 6.9201 16 7.90905 16 9C16 10.0915 15.5628 11.0809 14.854 11.8027ZM14 9C14 9.89982 13.4058 10.6608 12.5883 10.9121L16 22H8L11.4117 10.9121C10.5942 10.6608 10 9.89982 10 9C10 7.89543 10.8954 7 12 7C13.1046 7 14 7.89543 14 9Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default Transmit24Icon
