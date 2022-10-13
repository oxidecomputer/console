import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const CentosDistroIcon = ({
  title,
  titleId,
  ...props
}: SVGProps<SVGSVGElement> & SVGRProps) => (
  <svg
    width={16}
    height={16}
    viewBox="0 0 16 16"
    xmlns="http://www.w3.org/2000/svg"
    role="img"
    aria-labelledby={titleId}
    {...props}
  >
    {title ? <title id={titleId}>{title}</title> : null}
    <g id="distro/centos">
      <path
        id="Icon"
        d="M8.05067 0L5.922 2.15452H2.232V5.79722L0 8.0067L2.23267 10.2175V13.8307H5.81533L8.00533 16L10.1953 13.8307H13.8153V10.2283L16 8.01743L13.8453 5.83744V2.182H10.2067L8.05067 0ZM8.05067 0.502095L9.71067 2.182H8.584V6.49975L8.05067 7.03938L7.51067 6.49304V2.15452H6.418L8.05067 0.502095ZM2.584 2.50712H5.57267L4.32333 3.77141L7.15867 6.63985V7.07826H6.62667L3.78267 4.26144L2.584 5.44796V2.50712ZM6.06867 2.50712H7.15867V6.13709L4.81933 3.77074L6.06867 2.50712ZM8.93667 2.53595H10.0613L11.2813 3.77074L8.93667 6.14312V2.53595ZM10.5573 2.53595H13.4933V5.48148L12.2733 4.24669L9.446 7.10709H8.93667V6.64454L11.7773 3.77074L10.5573 2.53595ZM12.2733 4.74811L13.4933 5.98358V7.10709H9.942L12.2733 4.74811ZM3.78333 4.75683L6.12667 7.07759H2.584V5.9447L3.78333 4.75683ZM2.232 6.29328V7.43087H6.48333L7.064 8.00603L6.54267 8.52221H2.23333V9.71946L0.502 8.0067L2.232 6.29328ZM13.8453 6.33886L15.504 8.01676L13.8153 9.72616V8.52221H9.542L9.042 8.01676L9.592 7.46036H13.8453V6.33886ZM7.51067 6.99447L8.05067 7.54081L8.17467 7.41478L8.584 7.0005V7.46036H9.096L8.546 8.01676L9.046 8.52221H8.56667V9.06385L8.00533 8.50746L7.51133 8.99682V8.52288H7.04467L7.56533 8.0067L7.44 7.88202L6.98533 7.43154H7.51067V6.99447ZM2.584 8.87615H6.18533L3.78333 11.2559L2.58467 10.068L2.584 8.87615ZM6.68667 8.87615H7.15867V9.3454L4.22267 12.2534L5.45733 13.4761H2.584V10.5654L3.78267 11.752L6.68667 8.87615ZM8.91867 8.87615H9.39533L12.2733 11.7875L12.3973 11.6621L13.4633 10.5829V13.4761H10.5527L11.788 12.2527L11.6627 12.1287L8.91867 9.41109V8.87615ZM9.892 8.87615H13.4633V10.0814L12.2733 11.2854L9.892 8.87615ZM8.00533 9.00419L8.56667 9.55991V13.8301H9.694L8.006 15.5026L6.31733 13.8301H7.51067V9.49489L8.00533 9.00419ZM7.15867 9.8428V13.4761H5.95933L4.72467 12.2541L7.15867 9.8428ZM8.91867 9.90783L11.2867 12.2534L10.0513 13.4768H8.918L8.91867 9.90783Z"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default CentosDistroIcon
