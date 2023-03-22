import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}
const IpGlobal24Icon = ({
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
    <g id="24/ip-global">
      <path
        id="Subtract"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M13.4124 1.08983C12.9499 1.03056 12.4785 1 12 1C11.5215 1 11.0501 1.03056 10.5876 1.08983C10.2559 1.54273 9.9168 2.13898 9.59565 2.88834C9.10824 4.02562 8.70296 5.42043 8.42281 7H15.5772C15.297 5.42043 14.8918 4.02562 14.4044 2.88834C14.0832 2.13898 13.7441 1.54273 13.4124 1.08983ZM16.1062 1.792C16.7618 3.22828 17.2789 5.00448 17.606 7H21.8006C20.5981 4.64777 18.5737 2.78551 16.1062 1.792ZM22.5859 9H17.8619C17.9524 9.96647 18 10.9702 18 12C18 13.0297 17.9524 14.0335 17.8619 15H22.5859C22.8557 14.0463 23 13.04 23 12C23 10.96 22.8557 9.95366 22.5859 9ZM21.8006 17H17.606C17.2789 18.9955 16.7618 20.7717 16.1062 22.208C18.5737 21.2145 20.5981 19.3522 21.8006 17ZM13.4124 22.9102C12.9499 22.9694 12.4785 23 12 23C11.5215 23 11.0501 22.9694 10.5876 22.9102C10.2559 22.4573 9.91681 21.861 9.59565 21.1117C9.10824 19.9744 8.70296 18.5796 8.42282 17H15.5772C15.297 18.5796 14.8918 19.9744 14.4044 21.1117C14.0832 21.861 13.7441 22.4573 13.4124 22.9102ZM7.89381 22.208C5.42626 21.2145 3.40187 19.3522 2.19942 17H6.39397C6.72107 18.9955 7.23824 20.7717 7.89381 22.208ZM1.41406 15H6.13808C6.04765 14.0335 6 13.0297 6 12C6 10.9703 6.04765 9.96647 6.13808 9H1.41407C1.14433 9.95366 1 10.96 1 12C1 13.04 1.14433 14.0463 1.41406 15ZM2.19942 7H6.39397C6.72107 5.00447 7.23824 3.22828 7.8938 1.79199C5.42626 2.78551 3.40187 4.64777 2.19942 7ZM8 12C8 13.0398 8.0516 14.044 8.14739 15H15.8526C15.9484 14.044 16 13.0398 16 12C16 10.9602 15.9484 9.95602 15.8526 9H8.14739C8.0516 9.95602 8 10.9602 8 12Z"
        fill="currentColor"
      />
    </g>
  </svg>
)
export default IpGlobal24Icon
