import { Suspense } from 'react'
import AuthCallback from './AuthCallback'

export default function Page() {
   return (
      <Suspense fallback={
         <div className="bg-gray-900 h-screen flex justify-center items-center">
            <div className="loader" />
         </div>
      }>
         <AuthCallback />
      </Suspense>
   )
}
