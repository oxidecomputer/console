import * as React from 'react'
import type { SVGProps } from 'react'

interface SVGRProps {
  title?: string
  titleId?: string
}

const DebianDistroIcon = ({
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
    <g id="distro/debian">
      <path
        id="Icon"
        d="M9.76767 8.45686C9.49796 8.45686 9.82161 8.59025 10.1722 8.6436C10.2666 8.57691 10.3543 8.49687 10.4352 8.42351C10.2161 8.47116 9.99051 8.48243 9.76767 8.45686ZM11.2106 8.10338C11.3657 7.88328 11.4803 7.64318 11.5275 7.39642C11.4871 7.57649 11.3927 7.72989 11.305 7.88328C10.7993 8.19675 11.2578 7.70321 11.305 7.5098C10.7656 8.18341 11.2308 7.90996 11.2106 8.10338ZM11.7365 6.73614C11.7702 6.25594 11.6421 6.40267 11.6017 6.58941C11.6489 6.61609 11.6893 6.92288 11.7365 6.73614ZM8.75626 0.206753C8.89112 0.233431 9.05968 0.253439 9.03946 0.286786C9.19454 0.253439 9.22825 0.220092 8.74952 0.206753H8.75626ZM9.03946 0.286786L8.93832 0.306794L9.03271 0.300125V0.286786H9.03946ZM13.5031 6.91621C13.5166 7.34306 13.3683 7.54981 13.2469 7.91663L13.0109 8.03668C12.8221 8.39683 13.0311 8.27011 12.8963 8.5569C12.5996 8.81701 11.9928 9.37057 11.804 9.42393C11.6691 9.42393 11.8984 9.25719 11.9321 9.19717C11.5343 9.46394 11.6084 9.59733 11.0083 9.76407L10.9881 9.72405C9.49122 10.4177 7.41447 9.04377 7.44818 7.16298C7.42795 7.27636 7.40098 7.24969 7.36727 7.29637C7.32623 6.81792 7.43323 6.33843 7.67408 5.92153C7.91493 5.50462 8.27824 5.17 8.71581 4.96207C9.1195 4.76126 9.57467 4.68444 10.0228 4.74149C10.471 4.79853 10.8917 4.98684 11.2308 5.2822C11.0153 5.00558 10.7369 4.78298 10.4183 4.63237C10.0998 4.48176 9.74984 4.40736 9.39682 4.41517C8.60118 4.42184 7.85949 4.92205 7.61001 5.46228C7.20544 5.71571 7.15824 6.44268 6.98293 6.5694C6.7402 8.30346 7.42795 9.05044 8.5877 9.93081C8.76975 10.0575 8.64164 10.0709 8.66861 10.1642C8.27457 9.97931 7.92337 9.71593 7.63698 9.39058C7.79206 9.61067 7.95388 9.83076 8.17639 9.9975C7.80554 9.87745 7.32007 9.13047 7.17847 9.09712C7.80554 10.2043 9.72721 11.0446 10.7251 10.6311C10.1942 10.6683 9.66097 10.605 9.15408 10.4444C8.93157 10.3376 8.6349 10.1042 8.68209 10.0642C9.3344 10.3356 10.0489 10.4268 10.7495 10.3281C11.4501 10.2295 12.1105 9.94462 12.6603 9.50396C12.957 9.27053 13.2874 8.87703 13.3818 8.87036C13.2469 9.08379 13.4087 8.97707 13.3008 9.16382C13.5975 8.68362 13.166 8.96373 13.611 8.33681L13.7728 8.5569C13.7121 8.15673 14.2718 7.67653 14.2178 7.0496C14.346 6.84952 14.3527 7.24969 14.2178 7.69654C14.4134 7.203 14.2718 7.12964 14.319 6.7228C14.3729 6.85619 14.4404 7.00292 14.4741 7.14298C14.3527 6.67612 14.6089 6.34264 14.6629 6.07586C14.6022 6.04252 14.4741 6.27595 14.4471 5.72238C14.4471 5.47562 14.5145 5.589 14.5415 5.53564C14.4876 5.50229 14.3662 5.32222 14.2853 4.96207C14.3392 4.87536 14.4336 5.18216 14.5145 5.18883C14.4606 4.90871 14.3797 4.68862 14.3797 4.46853C14.1504 4.01501 14.2988 4.53522 14.11 4.26845C13.8807 3.54148 14.3122 4.10171 14.3392 3.77491C14.7033 4.28845 14.9056 5.08212 15 5.41559C14.9326 5.01542 14.8112 4.61526 14.6696 4.24177C14.7775 4.28845 14.4943 3.41476 14.8112 3.995C14.3916 2.74599 13.51 1.70011 12.3434 1.06711C12.4647 1.18049 12.6266 1.32722 12.5659 1.34723C12.0602 1.0471 12.1478 1.02709 12.0737 0.900375C11.6624 0.733639 11.6354 0.913714 11.3589 0.900375C10.5768 0.48687 10.4285 0.533556 9.71373 0.266778L9.74744 0.420175C9.22825 0.253439 9.1406 0.48687 8.58095 0.420175C8.54724 0.393497 8.76301 0.326803 8.93832 0.300125C8.43936 0.36682 8.46633 0.206753 7.97411 0.320133C8.08874 0.233431 8.21685 0.180075 8.34496 0.106711C7.9404 0.133389 7.37401 0.340142 7.54932 0.153397C6.88179 0.453522 5.70182 0.867028 5.04104 1.48062L5.02081 1.33389C4.71739 1.69404 3.69924 2.40767 3.61833 2.87453L3.53067 2.89454C3.37559 3.16132 3.27445 3.46144 3.14634 3.73489C2.94406 4.0817 2.84292 3.86828 2.87663 3.92163C2.47207 4.73531 2.26979 5.42226 2.09448 5.98916C2.21585 6.16924 2.09448 7.08962 2.14168 7.82993C1.9394 11.4714 4.73087 15.0129 7.77857 15.8333C8.23033 15.9867 8.89112 15.9867 9.4575 16C8.78998 15.8133 8.70232 15.9 8.05502 15.6732C7.58303 15.4598 7.48189 15.2063 7.1515 14.9196L7.28636 15.153C6.63231 14.9262 6.90202 14.8729 6.36935 14.7061L6.51095 14.5261C6.30192 14.506 5.9513 14.1726 5.8569 13.9858L5.62765 13.9925C5.3512 13.659 5.20286 13.4123 5.21635 13.2188L5.14218 13.3522C5.05452 13.2122 4.11729 12.085 4.60276 12.3451C4.51511 12.2651 4.39374 12.2118 4.26563 11.9783L4.36003 11.8649C4.12403 11.5715 3.92849 11.1847 3.94198 11.0646C4.07683 11.2247 4.15774 11.2647 4.2454 11.2847C3.65204 9.83743 3.61833 11.2047 3.16657 9.81742L3.26771 9.80408C3.20028 9.69737 3.14634 9.57732 3.0924 9.46394L3.13285 9.06378C2.70806 8.57024 3.01149 6.99625 3.07217 6.12922C3.11937 5.76907 3.42953 5.39558 3.66553 4.80867L3.52393 4.78199C3.79364 4.30846 5.10172 2.86786 5.70856 2.94123C5.9985 2.57441 5.64788 2.94123 5.5872 2.84785C6.23449 2.18758 6.43678 2.38099 6.86831 2.26094C7.3403 1.99416 6.46375 2.36765 6.68626 2.1609C7.49538 1.96082 7.25938 1.69404 8.31799 1.594C8.42587 1.66069 8.05502 1.68737 7.96737 1.7674C8.64164 1.4406 10.0913 1.52063 11.042 1.94748C12.1411 2.46103 13.375 3.95498 13.4222 5.3689L13.4761 5.38224C13.4492 5.94915 13.5638 6.59608 13.3615 7.18966L13.4964 6.90955L13.5031 6.91621ZM6.84134 8.82368L6.80762 9.01042C6.98293 9.24385 7.12453 9.49729 7.34704 9.68404C7.18521 9.37057 7.06385 9.24385 6.84134 8.81701V8.82368ZM7.25938 8.80367C7.16499 8.70363 7.11105 8.57691 7.05036 8.45686C7.1043 8.67028 7.22567 8.85702 7.3403 9.04377L7.25938 8.80367ZM14.6359 7.21634L14.5887 7.31638C14.5213 7.82326 14.3594 8.32347 14.1234 8.79033C14.3932 8.30346 14.5617 7.76323 14.6292 7.21634H14.6359ZM8.80346 0.0800333C8.98552 0.0133389 9.24848 0.0466861 9.44402 0C9.19454 0.0200083 8.94506 0.0333472 8.70232 0.0666945L8.80346 0.0800333ZM2.43836 3.42809C2.48556 3.80825 2.14842 3.96165 2.51253 3.70821C2.71481 3.26803 2.43836 3.58816 2.4451 3.42809H2.43836ZM2.01357 5.20217C2.09448 4.94206 2.11471 4.78866 2.14842 4.64193C1.91243 4.93539 2.03379 4.99541 2.01357 5.1955"
        fill="currentColor"
      />
    </g>
  </svg>
)

export default DebianDistroIcon
