import { Suspense, CSSProperties } from 'react'
import AuthCallback from './AuthCallback'

export default function Page() {
   return (
      <Suspense fallback={
         <div className="h-screen flex justify-center items-center" style={{ background: "var(--ds-background)" }}>
            <div className="loader" style={{ "--c": "no-repeat linear-gradient(var(--ds-text-secondary) 0 0)" } as CSSProperties} />
         </div>
      }>
         <AuthCallback />
      </Suspense>
   )
}
