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

export const ChartIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
         <path d="M14 18V10C14 9.0572 14 8.5858 13.7071 8.29289C13.4142 8 12.9428 8 12 8C11.0572 8 10.5858 8 10.2929 8.29289C10 8.5858 10 9.0572 10 10V18C10 18.9428 10 19.4142 10.2929 19.7071C10.5858 20 11.0572 20 12 20C12.9428 20 13.4142 20 13.7071 19.7071C14 19.4142 14 18.9428 14 18Z" stroke="white" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M21 17.3333V6.66667C21 5.4096 21 4.78107 20.7071 4.39052C20.4142 4 19.9428 4 19 4C18.0572 4 17.5858 4 17.2929 4.39052C17 4.78107 17 5.4096 17 6.66667V17.3333C17 18.5904 17 19.2189 17.2929 19.6095C17.5858 20 18.0572 20 19 20C19.9428 20 20.4142 20 20.7071 19.6095C21 19.2189 21 18.5904 21 17.3333Z" stroke="white" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
         <path d="M7 18.2222V13.7778C7 12.9397 7 12.5207 6.70711 12.2604C6.41421 12 5.94281 12 5 12C4.05719 12 3.58579 12 3.29289 12.2604C3 12.5207 3 12.9397 3 13.7778V18.2222C3 19.0603 3 19.4793 3.29289 19.7396C3.58579 20 4.05719 20 5 20C5.94281 20 6.41421 20 6.70711 19.7396C7 19.4793 7 19.0603 7 18.2222Z" stroke="white" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
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

export const DragIcon = ({ size = 24, stroke = 1.5 }: IconProps) => {
   return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width={size} height={size} fill="none">
         <path d="M8 6H8.00635M8 12H8.00635M8 18H8.00635M15.9937 6H16M15.9937 12H16M15.9937 18H16" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
   )
}