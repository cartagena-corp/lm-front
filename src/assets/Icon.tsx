import { IconProps } from "@/lib/types/types"

export const GoogleButton = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg width={size} height={size} viewBox="0 0 256 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid">
         <path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" />
         <path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" />
         <path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" />
         <path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" />
      </svg>
   )
}

export const BoardIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M17 2V4M12 2V4M7 2V4" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M3.5 10C3.5 6.70017 3.5 5.05025 4.52513 4.02513C5.55025 3 7.20017 3 10.5 3H13.5C16.7998 3 18.4497 3 19.4749 4.02513C20.5 5.05025 20.5 6.70017 20.5 10V15C20.5 18.2998 20.5 19.9497 19.4749 20.9749C18.4497 22 16.7998 22 13.5 22H10.5C7.20017 22 5.55025 22 4.52513 20.9749C3.5 19.9497 3.5 18.2998 3.5 15V10Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M13.5 16H17" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M13.5 9H17" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M7 10C7 10 7.5 10 8 11C8 11 9.58824 8.5 11 8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M7 17C7 17 7.5 17 8 18C8 18 9.58824 15.5 11 15" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const FilterIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M8.85746 12.5061C6.36901 10.6456 4.59564 8.59915 3.62734 7.44867C3.3276 7.09253 3.22938 6.8319 3.17033 6.3728C2.96811 4.8008 2.86701 4.0148 3.32795 3.5074C3.7889 3 4.60404 3 6.23433 3H17.7657C19.396 3 20.2111 3 20.672 3.5074C21.133 4.0148 21.0319 4.8008 20.8297 6.37281C20.7706 6.83191 20.6724 7.09254 20.3726 7.44867C19.403 8.60062 17.6261 10.6507 15.1326 12.5135C14.907 12.6821 14.7583 12.9567 14.7307 13.2614C14.4837 15.992 14.2559 17.4876 14.1141 18.2442C13.8853 19.4657 12.1532 20.2006 11.226 20.8563C10.6741 21.2466 10.0043 20.782 9.93278 20.1778C9.79643 19.0261 9.53961 16.6864 9.25927 13.2614C9.23409 12.9539 9.08486 12.6761 8.85746 12.5061Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const CalendarIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M16 2V6M8 2V6" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M13 4H11C7.22876 4 5.34315 4 4.17157 5.17157C3 6.34315 3 8.22876 3 12V14C3 17.7712 3 19.6569 4.17157 20.8284C5.34315 22 7.22876 22 11 22H13C16.7712 22 18.6569 22 19.8284 20.8284C21 19.6569 21 17.7712 21 14V12C21 8.22876 21 6.34315 19.8284 5.17157C18.6569 4 16.7712 4 13 4Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M3 10H21" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M11.9955 14H12.0045M11.9955 18H12.0045M15.991 14H16M8 14H8.00897M8 18H8.00897" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const LogoutIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M11 3L10.3374 3.23384C7.75867 4.144 6.46928 4.59908 5.73464 5.63742C5 6.67576 5 8.0431 5 10.7778V13.2222C5 15.9569 5 17.3242 5.73464 18.3626C6.46928 19.4009 7.75867 19.856 10.3374 20.7662L11 21" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M21 12L11 12M21 12C21 11.2998 19.0057 9.99153 18.5 9.5M21 12C21 12.7002 19.0057 14.0085 18.5 14.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const XIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M19.0005 4.99988L5.00049 18.9999M5.00049 4.99988L19.0005 18.9999" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const ClockIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={stroke} />
         <path d="M12 8V12L14 14" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const PlusIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M12 4V20M20 12H4" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const MenuIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M11.992 12H12.001" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M11.9842 18H11.9932" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M11.9998 6H12.0088" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const ListIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M8 5L20 5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"></path>
         <path d="M4 5H4.00898" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <path d="M4 12H4.00898" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <path d="M4 19H4.00898" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <path d="M8 12L20 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"></path>
         <path d="M8 19L20 19" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"></path>
      </svg>
   )
}

export const EditIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M16.4249 4.60509L17.4149 3.6151C18.2351 2.79497 19.5648 2.79497 20.3849 3.6151C21.205 4.43524 21.205 5.76493 20.3849 6.58507L19.3949 7.57506M16.4249 4.60509L9.76558 11.2644C9.25807 11.772 8.89804 12.4078 8.72397 13.1041L8 16L10.8959 15.276C11.5922 15.102 12.228 14.7419 12.7356 14.2344L19.3949 7.57506M16.4249 4.60509L19.3949 7.57506" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round"></path>
         <path d="M18.9999 13.5C18.9999 16.7875 18.9999 18.4312 18.092 19.5376C17.9258 19.7401 17.7401 19.9258 17.5375 20.092C16.4312 21 14.7874 21 11.4999 21H11C7.22876 21 5.34316 21 4.17159 19.8284C3.00003 18.6569 3 16.7712 3 13V12.5C3 9.21252 3 7.56879 3.90794 6.46244C4.07417 6.2599 4.2599 6.07417 4.46244 5.90794C5.56879 5 7.21252 5 10.5 5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
   )
}

export const AlertCircleIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth={stroke} />
         <path d="M11.992 15H12.001" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
         <path d="M12 12L12 8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const UsersIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M16.5 20V17.9704C16.5 16.7281 15.9407 15.5099 14.8103 14.9946C13.4315 14.3661 11.7779 14 10 14C8.22212 14 6.5685 14.3661 5.18968 14.9946C4.05927 15.5099 3.5 16.7281 3.5 17.9704V20" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <path d="M20.5 20.001V17.9713C20.5 16.729 19.9407 15.5109 18.8103 14.9956C18.5497 14.8768 18.2792 14.7673 18 14.668" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <circle cx="10" cy="7.5" r="3.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></circle>
         <path d="M15 4.14453C16.4457 4.57481 17.5 5.91408 17.5 7.49959C17.5 9.0851 16.4457 10.4244 15 10.8547" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
   )
}

export const SendIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M21.0477 3.05293C18.8697 0.707363 2.48648 6.4532 2.50001 8.551C2.51535 10.9299 8.89809 11.6617 10.6672 12.1581C11.7311 12.4565 12.016 12.7625 12.2613 13.8781C13.3723 18.9305 13.9301 21.4435 15.2014 21.4996C17.2278 21.5892 23.1733 5.342 21.0477 3.05293Z" stroke="currentColor" strokeWidth={stroke}></path>
         <path d="M11.5 12.5L15 9" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
   )
}

export const AttachIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M8 8.00049V6.00049C8 3.79135 9.79086 2.00049 12 2.00049C14.2091 2.00049 16 3.79135 16 6.00049V18.0005C16 20.2096 14.2091 22.0005 12 22.0005C9.79086 22.0005 8 20.2096 8 18.0005V13.5005C8 12.1198 9.11929 11.0005 10.5 11.0005C11.8807 11.0005 13 12.1198 13 13.5005V16.0005" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const DownloadIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M12 14.5L12 4.5M12 14.5C11.2998 14.5 9.99153 12.5057 9.5 12M12 14.5C12.7002 14.5 14.0085 12.5057 14.5 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <path d="M20 16.5C20 18.982 19.482 19.5 17 19.5H7C4.518 19.5 4 18.982 4 16.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
   )
}

export const DeleteIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 18.0801 5.10461 15.5152L4.5 5.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M9.5 16.5L9.5 10.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M14.5 16.5L14.5 10.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
      </svg>
   )
}

export const ConfigIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M21.3175 7.14139L20.8239 6.28479C20.4506 5.63696 20.264 5.31305 19.9464 5.18388C19.6288 5.05472 19.2696 5.15664 18.5513 5.36048L17.3311 5.70418C16.8725 5.80994 16.3913 5.74994 15.9726 5.53479L15.6357 5.34042C15.2766 5.11043 15.0004 4.77133 14.8475 4.37274L14.5136 3.37536C14.294 2.71534 14.1842 2.38533 13.9228 2.19657C13.6615 2.00781 13.3143 2.00781 12.6199 2.00781H11.5051C10.8108 2.00781 10.4636 2.00781 10.2022 2.19657C9.94085 2.38533 9.83106 2.71534 9.61149 3.37536L9.27753 4.37274C9.12465 4.77133 8.84845 5.11043 8.48937 5.34042L8.15249 5.53479C7.73374 5.74994 7.25259 5.80994 6.79398 5.70418L5.57375 5.36048C4.85541 5.15664 4.49625 5.05472 4.17867 5.18388C3.86109 5.31305 3.67445 5.63696 3.30115 6.28479L2.80757 7.14139C2.45766 7.74864 2.2827 8.05227 2.31666 8.37549C2.35061 8.69871 2.58483 8.95918 3.05326 9.48012L4.0843 10.6328C4.3363 10.9518 4.51521 11.5078 4.51521 12.0077C4.51521 12.5078 4.33636 13.0636 4.08433 13.3827L3.05326 14.5354C2.58483 15.0564 2.35062 15.3168 2.31666 15.6401C2.2827 15.9633 2.45766 16.2669 2.80757 16.8741L3.30114 17.7307C3.67443 18.3785 3.86109 18.7025 4.17867 18.8316C4.49625 18.9608 4.85542 18.8589 5.57377 18.655L6.79394 18.3113C7.25263 18.2055 7.73387 18.2656 8.15267 18.4808L8.4895 18.6752C8.84851 18.9052 9.12464 19.2442 9.2775 19.6428L9.61149 20.6403C9.83106 21.3003 9.94085 21.6303 10.2022 21.8191C10.4636 22.0078 10.8108 22.0078 11.5051 22.0078H12.6199C13.3143 22.0078 13.6615 22.0078 13.9228 21.8191C14.1842 21.6303 14.294 21.3003 14.5136 20.6403L14.8476 19.6428C15.0004 19.2442 15.2765 18.9052 15.6356 18.6752L15.9724 18.4808C16.3912 18.2656 16.8724 18.2055 17.3311 18.3113L18.5513 18.655C19.2696 18.8589 19.6288 18.9608 19.9464 18.8316C20.264 18.7025 20.4506 18.3785 20.8239 17.7307L21.3175 16.8741C21.6674 16.2669 21.8423 15.9633 21.8084 15.6401C21.7744 15.3168 21.5402 15.0564 21.0718 14.5354L20.0407 13.3827C19.7887 13.0636 19.6098 12.5078 19.6098 12.0077C19.6098 11.5078 19.7888 10.9518 20.0407 10.6328L21.0718 9.48012C21.5402 8.95918 21.7744 8.69871 21.8084 8.37549C21.8423 8.05227 21.6674 7.74864 21.3175 7.14139Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" />
         <path d="M15.5195 12C15.5195 13.933 13.9525 15.5 12.0195 15.5C10.0865 15.5 8.51953 13.933 8.51953 12C8.51953 10.067 10.0865 8.5 12.0195 8.5C13.9525 8.5 15.5195 10.067 15.5195 12Z" stroke="currentColor" strokeWidth={stroke} />
      </svg>
   )
}

export const BellIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M21 17.5H3C4.50991 16.896 5.5 15.4336 5.5 13.8074V9C5.5 5.41015 8.41015 2.5 12 2.5C15.5899 2.5 18.5 5.41015 18.5 9V13.8074C18.5 15.4336 19.4901 16.896 21 17.5Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M14.5 20.5C13.8557 21.1186 12.9733 21.5 12 21.5C11.0267 21.5 10.1443 21.1186 9.5 20.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const MegaphoneIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M21 9C21 10.9043 20.3152 12.6597 19.1827 13.9632C18.1041 15.2072 16.7043 16 15 16H9C7.29565 16 5.8957 15.2072 4.81726 13.9632C3.68484 12.6597 3 10.9043 3 9C3 7.09566 3.68484 5.34032 4.81726 4.03677C5.8957 2.79285 7.29565 2 9 2H15C16.7043 2 18.1041 2.79285 19.1827 4.03677C20.3152 5.34032 21 7.09566 21 9Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M8 16V22" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M16 16V22" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const EmptyStateIcon = ({ size = 48, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M3 10C3 6.22876 3 4.34315 4.17157 3.17157C5.34315 2 7.22876 2 11 2H13C16.7712 2 18.6569 2 19.8284 3.17157C21 4.34315 21 6.22876 21 10V14C21 17.7712 21 19.6569 19.8284 20.8284C18.6569 22 16.7712 22 13 22H11C7.22876 22 5.34315 22 4.17157 20.8284C3 19.6569 3 17.7712 3 14V10Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M12 7V13" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M12 17H12.01" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M7 12L17 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const AuditIcon = ({ size = 24, stroke = 2 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M11.5 21C7.02166 21 4.78249 21 3.39124 19.6088C2 18.2175 2 15.9783 2 11.5C2 7.02166 2 4.78249 3.39124 3.39124C4.78249 2 7.02166 2 11.5 2C15.9783 2 18.2175 2 19.6088 3.39124C21 4.78249 21 7.02166 21 11.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round"></path>
         <path d="M2 7H21" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round"></path>
         <path d="M10 16H11M6 16H7M10 12H14M6 12H7" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
         <path d="M20.4 20.4L22 22M21.2 17.6C21.2 15.6118 19.5882 14 17.6 14C15.6118 14 14 15.6118 14 17.6C14 19.5882 15.6118 21.2 17.6 21.2C19.5882 21.2 21.2 19.5882 21.2 17.6Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round"></path>
      </svg>
   )
}

export const EyeIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M21.544 11.045c.304.426.456.64.456.955 0 .315-.152.529-.456.955C20.478 14.581 16.69 20 12 20s-8.478-5.419-9.544-7.045C2.152 12.529 2 12.315 2 12c0-.315.152-.529.456-.955C3.522 9.419 7.31 4 12 4s8.478 5.419 9.544 7.045z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const EyeOffIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M6.873 17.129c-1.845-1.31-3.305-3.014-4.13-4.09-.15-.196-.225-.294-.225-.539 0-.245.075-.343.225-.539C3.487 10.731 7.1 6 12 6c1.856 0 3.605.394 5.12 1.085" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M17.128 6.872c1.845 1.31 3.305 3.014 4.129 4.09.15.196.226.294.226.539 0 .245-.076.343-.226.539C20.513 13.269 16.9 18 12 18c-1.856 0-3.605-.394-5.121-1.085" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M15 12a3 3 0 0 0-6 0" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="m2 2 20 20" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const ForbiddenIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M14.9994 15L9 9M9.00064 15L15 9" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const CheckmarkIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12Z" stroke="currentColor" strokeWidth={stroke} />
         <path d="M8 12.75C8 12.75 9.6 13.6625 10.4 15C10.4 15 12.8 9.75 16 8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const SidebarCollapseIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M3 3H21C21 3 21 3 21 3V21C21 21 21 21 21 21H3C3 21 3 21 3 21V3C3 3 3 3 3 3Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M9 3V21" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M14 8L12 10L14 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const SidebarExpandIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M3 3H21C21 3 21 3 21 3V21C21 21 21 21 21 21H3C3 21 3 21 3 21V3C3 3 3 3 3 3Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M9 3V21" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M12 8L14 10L12 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const SidebarOpenIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M3 3H21C21 3 21 3 21 3V21C21 21 21 21 21 21H3C3 21 3 21 3 21V3C3 3 3 3 3 3Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M9 3V21" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M12 8L14 10L12 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const SidebarCloseIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M3 3H21C21 3 21 3 21 3V21C21 21 21 21 21 21H3C3 21 3 21 3 21V3C3 3 3 3 3 3Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M9 3V21" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M14 8L12 10L14 12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const IAChatIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M14.1706 20.8905C18.3536 20.6125 21.6856 17.2332 21.9598 12.9909C22.0134 12.1607 22.0134 11.3009 21.9598 10.4707C21.6856 6.22838 18.3536 2.84913 14.1706 2.57107C12.7435 2.47621 11.2536 2.47641 9.8294 2.57107C5.64639 2.84913 2.31441 6.22838 2.04024 10.4707C1.98659 11.3009 1.98659 12.1607 2.04024 12.9909C2.1401 14.536 2.82343 15.9666 3.62791 17.1746C4.09501 18.0203 3.78674 19.0758 3.30021 19.9978C2.94941 20.6626 2.77401 20.995 2.91484 21.2351C3.05568 21.4752 3.37026 21.4829 3.99943 21.4982C5.24367 21.5285 6.08268 21.1757 6.74868 20.6846C7.1264 20.4061 7.31527 20.2668 7.44544 20.2508C7.5756 20.2348 7.83177 20.3403 8.34401 20.5513C8.8044 20.7409 9.33896 20.8579 9.8294 20.8905C11.2536 20.9852 12.7435 20.9854 14.1706 20.8905Z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
         <path d="M7.5 15L9.34189 9.47434C9.43631 9.19107 9.7014 9 10 9C10.2986 9 10.5637 9.19107 10.6581 9.47434L12.5 15M15.5 9V15M8.5 13H11.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const IAConfigIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M4 16.4999C4 18.1567 5.34315 19.4999 7 19.4999C7 20.8806 8.11929 21.9999 9.5 21.9999C10.8807 21.9999 12 20.8806 12 19.4999C12 20.8806 13.1193 21.9998 14.5 21.9998C15.8807 21.9998 17 20.8805 17 19.4998C18.6569 19.4998 20 18.1566 20 16.4998C20 15.9311 19.8418 15.3994 19.567 14.9463C20.9527 14.6812 22 13.4628 22 11.9998C22 10.5367 20.9527 9.31831 19.567 9.05325C19.8418 8.60012 20 8.06842 20 7.49976C20 5.8429 18.6569 4.49976 17 4.49976C17 3.11904 15.8807 1.99976 14.5 1.99976C13.1193 1.99976 12 3.11914 12 4.49985C12 3.11914 10.8807 1.99985 9.5 1.99985C8.11929 1.99985 7 3.11914 7 4.49985C5.34315 4.49985 4 5.843 4 7.49985C4 8.06851 4.15822 8.60022 4.43304 9.05335C3.04727 9.3184 2 10.5368 2 11.9999C2 13.4629 3.04727 14.6813 4.43304 14.9464C4.15822 15.3995 4 15.9312 4 16.4999Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M7.5 14.4999L9.34189 8.97422C9.43631 8.69095 9.7014 8.49988 10 8.49988C10.2986 8.49988 10.5637 8.69095 10.6581 8.97422L12.5 14.4999M15.5 8.49988V14.4999M8.5 12.4999H11.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const LaMurallaIcon = ({ size = 24 }) => (
   <svg width={size} height={size} viewBox="0 0 280 200" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M60 40H110V0H170V40H220V0H280V200H185V145C185 120.147 164.853 100 140 100C115.147 100 95 120.147 95 145V200H0V0H60V40Z" fill="currentColor" />
   </svg>
)

export const ExpandIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M9 9L4 4M4 4V8M4 4H8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M15 9L20 4M20 4V8M20 4H16" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M9 15L4 20M4 20V16M4 20H8" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M15 15L20 20M20 20V16M20 20H16" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const CompressIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M4 9L9 4M9 4V8M9 4H5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M20 9L15 4M15 4V8M15 4H19" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M4 15L9 20M9 20V16M9 20H5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M20 15L15 20M15 20V16M15 20H19" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const IAIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M4 16.4999C4 18.1567 5.34315 19.4999 7 19.4999C7 20.8806 8.11929 21.9999 9.5 21.9999C10.8807 21.9999 12 20.8806 12 19.4999C12 20.8806 13.1193 21.9998 14.5 21.9998C15.8807 21.9998 17 20.8805 17 19.4998C18.6569 19.4998 20 18.1566 20 16.4998C20 15.9311 19.8418 15.3994 19.567 14.9463C20.9527 14.6812 22 13.4628 22 11.9998C22 10.5367 20.9527 9.31831 19.567 9.05325C19.8418 8.60012 20 8.06842 20 7.49976C20 5.8429 18.6569 4.49976 17 4.49976C17 3.11904 15.8807 1.99976 14.5 1.99976C13.1193 1.99976 12 3.11914 12 4.49985C12 3.11914 10.8807 1.99985 9.5 1.99985C8.11929 1.99985 7 3.11914 7 4.49985C5.34315 4.49985 4 5.843 4 7.49985C4 8.06851 4.15822 8.60022 4.43304 9.05335C3.04727 9.3184 2 10.5368 2 11.9999C2 13.4629 3.04727 14.6813 4.43304 14.9464C4.15822 15.3995 4 15.9312 4 16.4999Z" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M7.5 14.4999L9.34189 8.97422C9.43631 8.69095 9.7014 8.49988 10 8.49988C10.2986 8.49988 10.5637 8.69095 10.6581 8.97422L12.5 14.4999M15.5 8.49988V14.4999M8.5 12.4999H11.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const ChatIAIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M14.1706 20.8905C18.3536 20.6125 21.6856 17.2332 21.9598 12.9909C22.0134 12.1607 22.0134 11.3009 21.9598 10.4707C21.6856 6.22838 18.3536 2.84913 14.1706 2.57107C12.7435 2.47621 11.2536 2.47641 9.8294 2.57107C5.64639 2.84913 2.31441 6.22838 2.04024 10.4707C1.98659 11.3009 1.98659 12.1607 2.04024 12.9909C2.1401 14.536 2.82343 15.9666 3.62791 17.1746C4.09501 18.0203 3.78674 19.0758 3.30021 19.9978C2.94941 20.6626 2.77401 20.995 2.91484 21.2351C3.05568 21.4752 3.37026 21.4829 3.99943 21.4982C5.24367 21.5285 6.08268 21.1757 6.74868 20.6846C7.1264 20.4061 7.31527 20.2668 7.44544 20.2508C7.5756 20.2348 7.83177 20.3403 8.34401 20.5513C8.8044 20.7409 9.33896 20.8579 9.8294 20.8905C11.2536 20.9852 12.7435 20.9854 14.1706 20.8905Z" stroke="currentColor" strokeWidth={stroke} strokeLinejoin="round" />
         <path d="M7.5 15L9.34189 9.47434C9.43631 9.19107 9.7014 9 10 9C10.2986 9 10.5637 9.19107 10.6581 9.47434L12.5 15M15.5 9V15M8.5 13H11.5" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const ImportIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"}>
         <path d="M12 3v12" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="m8 11 4 4 4-4" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M8 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}

export const FactoryIcon = ({ size = 24, stroke = 2 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
         <path d="M12 16h.01" strokeWidth={stroke} />
         <path d="M16 16h.01" strokeWidth={stroke} />
         <path d="M3 19a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5a.5.5 0 0 0-.769-.422l-4.462 2.844A.5.5 0 0 1 15 10.5v-2a.5.5 0 0 0-.769-.422L9.77 10.922A.5.5 0 0 1 9 10.5V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2z" strokeWidth={stroke} />
         <path d="M8 16h.01" strokeWidth={stroke} />
      </svg>
   )
}

export const KeyIcon = ({ size = 24, stroke = 1.5 }: IconProps) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke}>
      <path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z" />
      <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
   </svg>
)

export const ChevronRightIcon = ({ size = 24, stroke = 1.5 }: IconProps) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke}>
      <path d="m9 18 6-6-6-6" />
   </svg>
)

export const ArrowRightIcon = ({ size = 24, stroke = 1.5 }: IconProps) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke}>
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
   </svg>
)

export const LinkRedirect = ({ size = 24, stroke = 1.5 }: IconProps) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke}>
      <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
      <path d="m21 3-9 9" />
      <path d="M15 3h6v6" />
   </svg>
)

export const ChangeIcon = ({ size = 24, stroke = 1.5 }: IconProps) => (
   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill={"none"} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth={stroke}>
      <path d="m2 9 3-3 3 3" />
      <path d="M13 18H7a2 2 0 0 1-2-2V6" />
      <path d="m22 15-3 3-3-3" />
      <path d="M11 6h6a2 2 0 0 1 2 2v10" />
   </svg>
)