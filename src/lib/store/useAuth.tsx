import { create } from 'zustand'

interface stateProps {
   user: null | {
      first_name: string,
      last_name: string,
      email: string,
      log_id: string,
      plan: string,
   },
   isAuth: boolean,
   isAdmin: boolean,
   handleLogin: () => void,
   handleLogout: () => void
}

export const useAuth = create<stateProps>(set => ({
   user: null,
   isAuth: false,
   isAdmin: false,
   handleLogin: () => set({
      user: {
         first_name: "Kenn",
         last_name: "Marcucci",
         email: "test@test.com",
         log_id: "Google or Github ID",
         plan: "FREE",
      },
      isAuth: true,
      isAdmin: false
   }),
   handleLogout: () => set({ user: null, isAuth: false, isAdmin: false }),
}))