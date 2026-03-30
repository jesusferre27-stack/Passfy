import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/lib/types'
import { createClient } from '@/lib/supabase/client'

interface UserStore {
  user: User | null
  isLoading: boolean
  setUser: (user: User | null) => void
  setLoading: (loading: boolean) => void
  fetchProfile: () => Promise<void>
  signOut: () => Promise<void>
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isLoading: false,

      setUser: (user) => set({ user }),
      setLoading: (isLoading) => set({ isLoading }),

      fetchProfile: async () => {
        const supabase = createClient()
        set({ isLoading: true })
        try {
          const { data: { user: authUser } } = await supabase.auth.getUser()
          if (!authUser) { set({ user: null, isLoading: false }); return }

          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', authUser.id)
            .single()

          set({ user: profile as User, isLoading: false })
        } catch {
          set({ isLoading: false })
        }
      },

      signOut: async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        set({ user: null })
      },
    }),
    { name: 'pf-user-store' }
  )
)
