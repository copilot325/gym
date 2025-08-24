import { atom, computed } from 'nanostores'

export interface User {
  id: string
  email: string
  name?: string | null
  emailVerified: boolean
}

export interface Session {
  user: User
  expiresAt: string
}

// Store para la sesión del usuario
export const sessionStore = atom<Session | null>(null)

// Store computado para verificar si está autenticado
export const isAuthenticatedStore = computed(sessionStore, (session) => {
  if (!session) return false
  return new Date(session.expiresAt) > new Date()
})

// Store computado para obtener el usuario actual
export const currentUserStore = computed(sessionStore, (session) => {
  return session?.user || null
})

// Acciones para manejar la autenticación
export const authActions = {
  setSession: (session: Session) => {
    sessionStore.set(session)
  },
  
  clearSession: () => {
    sessionStore.set(null)
  },
  
  updateUser: (user: Partial<User>) => {
    const currentSession = sessionStore.get()
    if (currentSession) {
      sessionStore.set({
        ...currentSession,
        user: { ...currentSession.user, ...user }
      })
    }
  }
}
